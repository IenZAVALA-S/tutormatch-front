import { useState, type FormEvent, type InputHTMLAttributes } from 'react'
import { useMutation, useQuery } from '@apollo/client/react'
import { mensajeError } from '../apollo/errores'
import { AGREGAR_RAMOS_TUTOR, RAMOS } from '../auth/operaciones'
import type { UsuarioSesion } from '../auth/sesion'
import { validarNota, validarPeriodo } from '../utils/validacionRamos'
import { AvisoError, BotonNegro } from './formulario'

interface Fila {
  elegido: boolean
  nota: string
  periodo: string
}

type Campo = 'nota' | 'periodo'
type Errores = Partial<Record<Campo, string>>

const VACIA: Fila = { elegido: false, nota: '', periodo: '' }

function erroresFila(fila: Fila): Errores {
  const nota = validarNota(fila.nota)
  const periodo = validarPeriodo(fila.periodo)
  return { nota: nota.ok ? undefined : nota.error, periodo: periodo.ok ? undefined : periodo.error }
}

interface PropsFormulario {
  alTerminar: (usuario: UsuarioSesion) => void
  /** Ramos que no se ofrecen (los que el tutor ya tiene). */
  excluir?: string[]
  textoBoton?: string
}

/**
 * Formulario de ramos para inscribirse como tutor: por cada ramo del
 * catálogo, nota de aprobación (4.0 a 7.0) y periodo. Todo o nada.
 * Se reutiliza en el registro de tutor y en el perfil.
 *
 * Los errores se muestran bajo cada campo: al salir de un campo con algo
 * escrito, al enviar, y se van actualizando mientras se corrige.
 */
export function FormularioRamos({ alTerminar, excluir = [], textoBoton = 'Inscribirme como tutor' }: PropsFormulario) {
  const { data, loading: cargando, error: errorCarga } = useQuery(RAMOS)
  const [agregar, { loading: enviando }] = useMutation(AGREGAR_RAMOS_TUTOR)
  const [filas, setFilas] = useState<Record<string, Fila>>({})
  const [errores, setErrores] = useState<Record<string, Errores>>({})
  const [error, setError] = useState<string | null>(null)
  const ofrecidos = (data?.ramos ?? []).filter((r) => !excluir.includes(r.codigo))

  const fila = (codigo: string): Fila => filas[codigo] ?? VACIA

  function ponerError(codigo: string, campo: Campo, mensaje: string | undefined) {
    setErrores((actual) => ({ ...actual, [codigo]: { ...actual[codigo], [campo]: mensaje } }))
  }

  function cambiar(codigo: string, cambios: Partial<Fila>) {
    const nueva = { ...fila(codigo), ...cambios }
    setFilas((actual) => ({ ...actual, [codigo]: nueva }))
    // Si el campo ya mostraba un error, se revalida mientras se escribe.
    for (const campo of ['nota', 'periodo'] as const) {
      if (campo in cambios && errores[codigo]?.[campo]) ponerError(codigo, campo, erroresFila(nueva)[campo])
    }
    if (cambios.elegido === false) setErrores((actual) => ({ ...actual, [codigo]: {} }))
  }

  /** Al salir de un campo con algo escrito, se valida ese campo. */
  function alSalir(codigo: string, campo: Campo) {
    if (!fila(codigo)[campo].trim()) return
    ponerError(codigo, campo, erroresFila(fila(codigo))[campo])
  }

  async function enviar(evento: FormEvent) {
    evento.preventDefault()
    const elegidos = ofrecidos.filter((r) => fila(r.codigo).elegido)
    if (elegidos.length === 0) return setError('Elige al menos un ramo.')

    const nuevos = Object.fromEntries(elegidos.map((r) => [r.codigo, erroresFila(fila(r.codigo))]))
    setErrores(nuevos)
    const conErrores = elegidos.filter((r) => nuevos[r.codigo].nota || nuevos[r.codigo].periodo)
    if (conErrores.length > 0) {
      return setError(
        conErrores.length === 1
          ? `Revisa los datos de ${conErrores[0].nombre}.`
          : `Revisa los datos de ${conErrores.length} ramos.`,
      )
    }

    setError(null)
    try {
      const { data: respuesta } = await agregar({
        variables: {
          ramos: elegidos.map((r) => {
            const nota = validarNota(fila(r.codigo).nota)
            const periodo = validarPeriodo(fila(r.codigo).periodo)
            return {
              ramoCodigo: r.codigo,
              notaAprobacion: nota.ok ? nota.valor : 0,
              periodoAprobacion: periodo.ok ? periodo.valor : '',
            }
          }),
        },
      })
      if (respuesta) alTerminar(respuesta.agregarRamosTutor)
    } catch (e) {
      setError(mensajeError(e))
    }
  }

  if (cargando) return <p className="text-marca-100">Cargando ramos…</p>
  if (errorCarga) return <AvisoError>{mensajeError(errorCarga)}</AvisoError>
  if (ofrecidos.length === 0) return <p className="text-marca-100">Ya tienes todos los ramos del catálogo.</p>

  return (
    <form onSubmit={enviar} className="space-y-4" noValidate>
      <ul className="space-y-2">
        {ofrecidos.map((ramo) => {
          const actual = fila(ramo.codigo)
          const err = errores[ramo.codigo] ?? {}
          return (
            <li
              key={ramo.codigo}
              className="rounded-lg bg-marca-600/80 p-3 shadow-[inset_0_1px_0_rgb(255_255_255/0.15)] dark:bg-marca-900/60"
            >
              <label className="flex cursor-pointer items-center gap-3">
                <input
                  type="checkbox"
                  checked={actual.elegido}
                  onChange={(e) => cambiar(ramo.codigo, { elegido: e.target.checked })}
                  className="h-5 w-5 accent-tinta-800"
                />
                <span className="font-medium">{ramo.nombre}</span>
                <span className="ml-auto text-xs text-marca-200">{ramo.codigo}</span>
              </label>
              {/*
                Despliegue hacia abajo: la fila de la grilla pasa de 0fr a 1fr.
                Plegado queda `inert` para que no se pueda tabular a sus campos.
              */}
              <div
                inert={!actual.elegido}
                className={`grid transition-[grid-template-rows,opacity] duration-300 ease-out ${
                  actual.elegido ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
                }`}
              >
                <div className="overflow-hidden">
                  <div
                    className={`mt-3 grid grid-cols-2 items-start gap-3 transition-transform duration-300 ease-out ${
                      actual.elegido ? 'translate-y-0' : '-translate-y-2'
                    }`}
                  >
                    <CampoRamo
                      id={`nota-${ramo.codigo}`}
                      etiqueta="Nota de aprobación"
                      error={err.nota}
                      inputMode="decimal"
                      placeholder="6.2"
                      value={actual.nota}
                      onChange={(e) => cambiar(ramo.codigo, { nota: e.target.value })}
                      onBlur={() => alSalir(ramo.codigo, 'nota')}
                    />
                    <CampoRamo
                      id={`periodo-${ramo.codigo}`}
                      etiqueta="Periodo (año-semestre)"
                      error={err.periodo}
                      placeholder="2025-2"
                      value={actual.periodo}
                      onChange={(e) => cambiar(ramo.codigo, { periodo: e.target.value })}
                      onBlur={() => alSalir(ramo.codigo, 'periodo')}
                    />
                  </div>
                </div>
              </div>
            </li>
          )
        })}
      </ul>
      <AvisoError>{error}</AvisoError>
      <BotonNegro type="submit" disabled={enviando} className="w-full">
        {enviando ? 'Guardando…' : textoBoton}
      </BotonNegro>
    </form>
  )
}

interface PropsCampoRamo extends InputHTMLAttributes<HTMLInputElement> {
  id: string
  etiqueta: string
  error?: string
}

/** Campo blanco sobre el bloque naranjo, con su mensaje de error debajo. */
function CampoRamo({ id, etiqueta, error, ...resto }: PropsCampoRamo) {
  return (
    <div className="text-sm">
      <label htmlFor={id} className="mb-1 block">
        {etiqueta}
      </label>
      <input
        id={id}
        aria-invalid={!!error}
        aria-describedby={error ? `${id}-error` : undefined}
        className={`w-full rounded-lg bg-white px-3 py-2 text-tinta-800 outline-none placeholder:text-tinta-400 focus:ring-4 focus:ring-tinta-800/20 dark:bg-tinta-800 dark:text-marca-50 ${
          error ? 'ring-2 ring-tinta-900 dark:ring-sol-300' : ''
        }`}
        {...resto}
      />
      {error && (
        <p
          id={`${id}-error`}
          className="mt-1.5 flex animate-entrar gap-1.5 rounded-md bg-tinta-900/85 px-2 py-1.5 text-xs leading-snug font-medium text-white"
        >
          <span aria-hidden className="text-sol-300">
            !
          </span>
          {error}
        </p>
      )}
    </div>
  )
}
