import type { PendientesQuery } from '../../../gql/graphql'
import { Boton } from '../../../components/Modal'
import { describirInicio } from '../../../utils/bloques'
import { nombreAlumno } from './estados'

type Pendiente = PendientesQuery['sesiones'][number]

interface Props {
  pendientes: Pendiente[]
  cargando: boolean
  nombreRamo: (codigo: string) => string
  /** Id de la sesión que se está aceptando o rechazando. */
  ocupada: string | null
  alAceptar: (id: string) => void
  alRechazar: (id: string) => void
}

/** Caja de notificaciones: reservas que esperan que el tutor las acepte. */
export function Notificaciones({ pendientes, cargando, nombreRamo, ocupada, alAceptar, alRechazar }: Props) {
  const ordenadas = [...pendientes].sort((a, b) => a.inicio.localeCompare(b.inicio))

  return (
    // Alto fijo en pantallas medianas: así la grilla no salta cuando cambia la cantidad de reservas.
    <section className="flex h-full max-h-80 flex-col rounded-2xl border border-borde bg-superficie/90 p-4 shadow-sm backdrop-blur md:h-56">

      <header className="flex items-center gap-2">
        <h2 className="font-semibold">Notificaciones</h2>
        {ordenadas.length > 0 && (
          <span className="rounded-full bg-sol-300 px-2 py-0.5 text-xs font-bold text-sol-800">
            {ordenadas.length}
          </span>
        )}
      </header>

      {cargando && ordenadas.length === 0 ? (
        <p className="mt-3 text-sm text-texto-suave">Buscando reservas…</p>
      ) : ordenadas.length === 0 ? (
        <p className="mt-3 text-sm text-texto-suave">No tienes reservas por confirmar.</p>
      ) : (
        <ul className="mt-3 min-h-0 flex-1 space-y-2 overflow-y-auto pr-1">
          {ordenadas.map((s) => (
            <li
              key={s.id}
              className="flex animate-entrar flex-wrap items-center gap-x-3 gap-y-2 rounded-xl border border-sol-200 bg-sol-100/70 p-3 text-sm dark:border-sol-800 dark:bg-sol-800/25"
            >
              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold">{nombreAlumno(s)}</p>
                <p className="truncate text-texto-suave">
                  {nombreRamo(s.ramoCodigo)} · {describirInicio(s.inicio)}
                </p>
              </div>
              <div className="flex gap-2">
                <Boton tono="acento" disabled={ocupada === s.id} onClick={() => alAceptar(s.id)}>
                  Aceptar
                </Boton>
                <Boton disabled={ocupada === s.id} onClick={() => alRechazar(s.id)}>
                  Rechazar
                </Boton>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
