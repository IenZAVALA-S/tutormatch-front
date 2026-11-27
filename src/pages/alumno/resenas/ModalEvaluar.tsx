import { useState } from 'react'
import { useMutation } from '@apollo/client/react'
import { mensajeError } from '../../../apollo/errores'
import { Estrellas, EstrellasInput, NOMBRES_NOTA } from '../../../components/Estrellas'
import { AreaTexto, AvisoError } from '../../../components/formulario'
import { Boton, Modal } from '../../../components/Modal'
import { EVALUAR } from '../operaciones'

const MAXIMO = 1000

export interface SesionPorEvaluar {
  id: string
  tutor: string
  ramo: string
  horario: string
}

interface Props {
  sesion: SesionPorEvaluar | null
  alCerrar: () => void
  alEvaluar: () => void
}

/**
 * Evaluar una sesión: estrellas de 1 a 5 y comentario opcional (hasta 1000
 * caracteres). Antes de enviar, una confirmación avisa que no se puede editar.
 */
export function ModalEvaluar({ sesion, alCerrar, alEvaluar }: Props) {
  const [paso, setPaso] = useState<'escribir' | 'confirmar'>('escribir')
  const [nota, setNota] = useState(0)
  const [comentario, setComentario] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [evaluar, { loading }] = useMutation(EVALUAR, {
    refetchQueries: ['ResenasAlumno'],
    awaitRefetchQueries: true,
  })

  function cerrar() {
    if (loading) return
    setPaso('escribir')
    setNota(0)
    setComentario('')
    setError(null)
    alCerrar()
  }

  async function enviar() {
    if (!sesion) return
    setError(null)
    try {
      await evaluar({ variables: { sesionId: sesion.id, nota, comentario: comentario.trim() || null } })
      alEvaluar()
      setPaso('escribir')
      setNota(0)
      setComentario('')
      alCerrar()
    } catch (e) {
      setPaso('escribir')
      setError(
        mensajeError(e, {
          CONFLICT: 'Esta sesión ya fue evaluada.',
          FORBIDDEN: 'Solo puedes evaluar sesiones en las que participaste.',
        }),
      )
    }
  }

  const restantes = MAXIMO - comentario.length

  return (
    <Modal
      abierto={!!sesion}
      titulo={paso === 'escribir' ? 'Evaluar tutoría' : '¿Enviar la reseña?'}
      subtitulo={sesion ? `${sesion.ramo} con ${sesion.tutor} · ${sesion.horario}` : undefined}
      alCerrar={cerrar}
      acciones={
        paso === 'escribir' ? (
          <>
            <Boton onClick={cerrar}>Cancelar</Boton>
            <Boton tono="peligro" disabled={nota === 0 || restantes < 0} onClick={() => setPaso('confirmar')}>
              Continuar
            </Boton>
          </>
        ) : (
          <>
            <Boton onClick={() => setPaso('escribir')} disabled={loading}>
              Volver a editar
            </Boton>
            <Boton tono="peligro" onClick={enviar} disabled={loading}>
              {loading ? 'Enviando…' : 'Enviar reseña'}
            </Boton>
          </>
        )
      }
    >
      {paso === 'escribir' ? (
        <div className="space-y-5 pt-2">
          <EstrellasInput valor={nota} alCambiar={setNota} />
          <div>
            <AreaTexto
              etiqueta="Comentario (opcional)"
              name="comentario"
              rows={4}
              value={comentario}
              onChange={(e) => setComentario(e.target.value)}
              placeholder="¿Qué te sirvió? ¿Qué podría mejorar?"
            />
            <p className={`mt-1 text-right text-xs ${restantes < 0 ? 'font-semibold text-marca-700 dark:text-marca-300' : ''}`}>
              {restantes < 0 ? `Te pasaste por ${-restantes} caracteres` : `${restantes} caracteres disponibles`}
            </p>
          </div>
          <AvisoError>{error}</AvisoError>
          <p className="text-xs">Tu reseña es anónima: el tutor no ve quién la escribió.</p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="rounded-xl border border-borde bg-fondo/60 p-4">
            <p className="flex items-center gap-2 font-semibold text-texto">
              <Estrellas valor={nota} tamano="sm" />
              {NOMBRES_NOTA[nota]}
            </p>
            {comentario.trim() ? (
              <p className="mt-2 whitespace-pre-line text-texto">{comentario.trim()}</p>
            ) : (
              <p className="mt-2 italic">Sin comentario.</p>
            )}
          </div>
          <p className="rounded-lg bg-sol-100 px-3 py-2 font-medium text-sol-800 dark:bg-sol-800/30 dark:text-sol-200">
            Una vez enviada, la reseña no se puede editar ni borrar.
          </p>
        </div>
      )}
    </Modal>
  )
}
