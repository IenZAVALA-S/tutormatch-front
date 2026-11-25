import { useState, type FormEvent } from 'react'
import { useMutation, useQuery } from '@apollo/client/react'
import { mensajeError } from '../apollo/errores'
import { AGREGAR_RAMOS_TUTOR, RAMOS } from '../auth/operaciones'
import type { UsuarioSesion } from '../auth/sesion'
import { AvisoError, BotonNegro } from './formulario'

interface Fila {
  elegido: boolean
  nota: string
  periodo: string
}

const PERIODO = /^\d{4}-[12]$/

/** Valida una fila elegida; devuelve el problema o null. */
function problemaFila(fila: Fila): string | null {
  const nota = Number(fila.nota.replace(',', '.'))
  if (!fila.nota || Number.isNaN(nota) || nota < 4 || nota > 7) return 'La nota debe estar entre 4.0 y 7.0.'
  if (!PERIODO.test(fila.periodo.trim())) return 'El periodo va como año-semestre, por ejemplo 2025-2.'
  return null
}

/**
 * Formulario de ramos para inscribirse como tutor: por cada ramo del
 * catálogo, nota de aprobación (4.0 a 7.0) y periodo. Todo o nada.
 * Se reutiliza en el registro de tutor y en el perfil.
 */
export function FormularioRamos({ alTerminar }: { alTerminar: (usuario: UsuarioSesion) => void }) {
  const { data, loading: cargando, error: errorCarga } = useQuery(RAMOS)
  const [agregar, { loading: enviando }] = useMutation(AGREGAR_RAMOS_TUTOR)
  const [filas, setFilas] = useState<Record<string, Fila>>({})
  const [error, setError] = useState<string | null>(null)

  const fila = (codigo: string): Fila => filas[codigo] ?? { elegido: false, nota: '', periodo: '' }
  const cambiar = (codigo: string, cambios: Partial<Fila>) =>
    setFilas((actual) => ({ ...actual, [codigo]: { ...fila(codigo), ...cambios } }))

  async function enviar(evento: FormEvent) {
    evento.preventDefault()
    const ramos = data?.ramos ?? []
    const elegidos = ramos.filter((r) => fila(r.codigo).elegido)
    if (elegidos.length === 0) return setError('Elige al menos un ramo.')
    for (const ramo of elegidos) {
      const problema = problemaFila(fila(ramo.codigo))
      if (problema) return setError(`${ramo.nombre}: ${problema}`)
    }
    setError(null)
    try {
      const { data: respuesta } = await agregar({
        variables: {
          ramos: elegidos.map((r) => ({
            ramoCodigo: r.codigo,
            notaAprobacion: Number(fila(r.codigo).nota.replace(',', '.')),
            periodoAprobacion: fila(r.codigo).periodo.trim(),
          })),
        },
      })
      if (respuesta) alTerminar(respuesta.agregarRamosTutor)
    } catch (e) {
      setError(mensajeError(e))
    }
  }

  if (cargando) return <p className="text-marca-100">Cargando ramos…</p>
  if (errorCarga) return <AvisoError>{mensajeError(errorCarga)}</AvisoError>

  return (
    <form onSubmit={enviar} className="space-y-4" noValidate>
      <ul className="space-y-2">
        {data?.ramos.map((ramo) => {
          const actual = fila(ramo.codigo)
          return (
            <li key={ramo.codigo} className="rounded-lg bg-marca-600/80 p-3 shadow-[inset_0_1px_0_rgb(255_255_255/0.15)] dark:bg-marca-900/60">
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
                  className={`mt-3 grid grid-cols-2 gap-3 transition-transform duration-300 ease-out ${
                    actual.elegido ? 'translate-y-0' : '-translate-y-2'
                  }`}
                >
                  <label className="block text-sm">
                    <span className="mb-1 block">Nota de aprobación</span>
                    <input
                      inputMode="decimal"
                      placeholder="6.2"
                      value={actual.nota}
                      onChange={(e) => cambiar(ramo.codigo, { nota: e.target.value })}
                      className="w-full rounded-lg bg-white px-3 py-2 text-tinta-800 outline-none placeholder:text-tinta-400 focus:ring-4 focus:ring-tinta-800/20 dark:bg-tinta-800 dark:text-marca-50"
                    />
                  </label>
                  <label className="block text-sm">
                    <span className="mb-1 block">Periodo</span>
                    <input
                      placeholder="2025-2"
                      value={actual.periodo}
                      onChange={(e) => cambiar(ramo.codigo, { periodo: e.target.value })}
                      className="w-full rounded-lg bg-white px-3 py-2 text-tinta-800 outline-none placeholder:text-tinta-400 focus:ring-4 focus:ring-tinta-800/20 dark:bg-tinta-800 dark:text-marca-50"
                    />
                  </label>
                </div>
                </div>
              </div>
            </li>
          )
        })}
      </ul>
      <AvisoError>{error}</AvisoError>
      <BotonNegro type="submit" disabled={enviando} className="w-full">
        {enviando ? 'Inscribiendo…' : 'Inscribirme como tutor'}
      </BotonNegro>
    </form>
  )
}
