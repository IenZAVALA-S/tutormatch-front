import { useState, type FormEvent } from 'react'
import { useMutation } from '@apollo/client/react'
import { mensajeError } from '../../../apollo/errores'
import { AreaTexto, AvisoError, Campo } from '../../../components/formulario'
import { Boton, Modal } from '../../../components/Modal'
import { PUBLICAR_AVISO } from '../operaciones'

interface Props {
  abierto: boolean
  ramoCodigo: string
  nombreRamo: string
  alCerrar: () => void
  alPublicar: () => void
}

/** Publicar aviso: título y texto (`publicarAviso`). */
export function ModalAviso({ abierto, ramoCodigo, nombreRamo, alCerrar, alPublicar }: Props) {
  const [titulo, setTitulo] = useState('')
  const [texto, setTexto] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [publicar, { loading }] = useMutation(PUBLICAR_AVISO, { refetchQueries: ['MaterialTutor'] })

  function cerrar() {
    if (loading) return
    setTitulo('')
    setTexto('')
    setError(null)
    alCerrar()
  }

  async function enviar(e: FormEvent) {
    e.preventDefault()
    if (!titulo.trim() || !texto.trim()) return setError('Completa el título y el texto.')
    setError(null)
    try {
      await publicar({ variables: { ramoCodigo, titulo: titulo.trim(), texto: texto.trim() } })
      alPublicar()
      setTitulo('')
      setTexto('')
      alCerrar()
    } catch (e) {
      setError(mensajeError(e, { FORBIDDEN: 'No puedes publicar en este ramo porque no lo tienes activo.' }))
    }
  }

  return (
    <Modal
      abierto={abierto}
      titulo={`Publicar aviso · ${nombreRamo}`}
      alCerrar={cerrar}
      acciones={
        <>
          <Boton onClick={cerrar} disabled={loading}>
            Cancelar
          </Boton>
          <Boton tono="acento" type="submit" form="form-aviso" disabled={loading}>
            {loading ? 'Publicando…' : 'Publicar'}
          </Boton>
        </>
      }
    >
      <form id="form-aviso" onSubmit={enviar} className="space-y-4" noValidate>
        <Campo
          variante="superficie"
          etiqueta="Título"
          name="titulo-aviso"
          value={titulo}
          onChange={(e) => setTitulo(e.target.value)}
          placeholder="Cambio de sala el jueves"
          autoFocus
        />
        <AreaTexto
          etiqueta="Texto"
          name="texto-aviso"
          rows={5}
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
          placeholder="Escribe aquí el aviso para tus alumnos…"
        />
        <AvisoError>{error}</AvisoError>
      </form>
    </Modal>
  )
}
