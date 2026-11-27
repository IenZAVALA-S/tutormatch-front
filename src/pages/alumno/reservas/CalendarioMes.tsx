import { Cargando } from '../../../components/Carga'
import { diaSemana, fechaChile, sumarDias, type FechaChile } from '../../../utils/bloques'

export interface ResumenDia {
  /** Horarios libres que se pueden reservar. */
  libres: number
  /** Reservas propias pendientes o confirmadas ese día. */
  pendientes: number
  confirmadas: number
}

interface Props {
  /** Días del mes, en hora de Chile. */
  dias: FechaChile[]
  resumen: Map<FechaChile, ResumenDia>
  ahora: Date
  cargando: boolean
  alElegir: (dia: FechaChile) => void
}

const NOMBRES = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes']

/**
 * Mes de lunes a viernes (los bloques no existen el fin de semana). Cada
 * día muestra cuántos horarios hay y si el alumno ya tiene una reserva.
 */
export function CalendarioMes({ dias, resumen, ahora, cargando, alElegir }: Props) {
  const hoy = fechaChile(ahora)
  const enMes = new Set(dias)
  const semanas = semanasDelMes(dias)

  return (
    <div className="relative">
      <div className="grid grid-cols-5 gap-1.5 sm:gap-2">
        {NOMBRES.map((n) => (
          <p key={n} className="pb-1 text-center text-xs font-semibold tracking-wide text-texto-suave uppercase">
            <span className="sm:hidden">{n.slice(0, 2)}</span>
            <span className="hidden sm:inline">{n}</span>
          </p>
        ))}
        {semanas.flat().map((dia) => {
          if (!enMes.has(dia)) return <span key={dia} aria-hidden />
          const r = resumen.get(dia) ?? { libres: 0, pendientes: 0, confirmadas: 0 }
          const pasado = dia < hoy
          const conAlgo = !pasado && (r.libres > 0 || r.pendientes > 0 || r.confirmadas > 0)
          return (
            <button
              key={dia}
              type="button"
              disabled={!conAlgo}
              onClick={() => alElegir(dia)}
              aria-label={etiqueta(dia, r, pasado)}
              className={`group relative flex min-h-20 flex-col items-start rounded-xl border p-2 text-left transition duration-150 sm:min-h-24 sm:p-2.5 ${
                conAlgo
                  ? r.libres > 0
                    ? 'border-marca-200 bg-marca-50 hover:-translate-y-0.5 hover:border-marca-400 hover:shadow-md dark:border-marca-800 dark:bg-marca-900/30 dark:hover:border-marca-500'
                    : 'border-borde bg-superficie hover:-translate-y-0.5 hover:shadow-md'
                  : 'cursor-default border-transparent bg-tinta-50/60 text-texto-suave dark:bg-tinta-900/40'
              } ${pasado ? 'opacity-55' : ''}`}
            >
              <span
                className={`grid h-7 w-7 place-items-center rounded-full text-sm font-bold ${
                  dia === hoy ? 'bg-marca-500 text-white' : ''
                }`}
              >
                {Number(dia.slice(8))}
              </span>
              {!pasado && r.libres > 0 && (
                <span className="mt-auto rounded-full bg-marca-500 px-2 py-0.5 text-[0.7rem] font-bold text-white shadow-sm">
                  {r.libres}
                  <span className="hidden sm:inline"> {r.libres === 1 ? 'horario' : 'horarios'}</span>
                </span>
              )}
              {(r.pendientes > 0 || r.confirmadas > 0) && (
                <span className="absolute top-2 right-2 flex gap-1" aria-hidden>
                  {r.confirmadas > 0 && <span className="h-2.5 w-2.5 rounded-full bg-acento-500" />}
                  {r.pendientes > 0 && <span className="h-2.5 w-2.5 rounded-full bg-sol-400" />}
                </span>
              )}
            </button>
          )
        })}
      </div>

      {cargando && (
        <div className="absolute inset-0 grid place-items-center rounded-xl bg-superficie/50 text-white backdrop-blur-[2px]">
          <Cargando className="rounded-full bg-tinta-800/70 px-5 py-2.5 shadow-lg" />
        </div>
      )}
    </div>
  )
}

/** Leyenda bajo el calendario. */
export function LeyendaMes() {
  return (
    <ul className="flex flex-wrap gap-x-4 gap-y-2 text-xs text-texto-suave">
      <li className="flex items-center gap-1.5">
        {/* Muestra de la pastilla, sin número para que no parezca un dato. */}
        <span className="h-2.5 w-5 rounded-full bg-marca-500" />
        Horarios disponibles (el número indica cuántos)
      </li>
      <li className="flex items-center gap-1.5">
        <span className="h-2.5 w-2.5 rounded-full bg-sol-400" />
        Tu reserva pendiente
      </li>
      <li className="flex items-center gap-1.5">
        <span className="h-2.5 w-2.5 rounded-full bg-acento-500" />
        Tu reserva confirmada
      </li>
    </ul>
  )
}

/** Semanas (lunes a viernes) que cubren el mes; los días de otro mes quedan vacíos. */
function semanasDelMes(dias: FechaChile[]): FechaChile[][] {
  if (dias.length === 0) return []
  const ultimo = dias[dias.length - 1]
  const semanas: FechaChile[][] = []
  for (let lunes = sumarDias(dias[0], 1 - diaSemana(dias[0])); lunes <= ultimo; lunes = sumarDias(lunes, 7)) {
    const semana = [0, 1, 2, 3, 4].map((i) => sumarDias(lunes, i))
    // Si el mes empieza en fin de semana, la primera semana queda entera fuera.
    if (semana.some((d) => d >= dias[0] && d <= ultimo)) semanas.push(semana)
  }
  return semanas
}

function etiqueta(dia: FechaChile, r: ResumenDia, pasado: boolean) {
  const partes = [`${Number(dia.slice(8))}`]
  if (pasado) partes.push('ya pasó')
  else partes.push(r.libres === 0 ? 'sin horarios' : `${r.libres} ${r.libres === 1 ? 'horario' : 'horarios'}`)
  if (r.pendientes) partes.push(`${r.pendientes} reserva pendiente`)
  if (r.confirmadas) partes.push(`${r.confirmadas} reserva confirmada`)
  return partes.join(', ')
}
