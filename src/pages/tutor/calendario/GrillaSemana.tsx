import { Cargando } from '../../../components/Carga'
import {
  BLOQUES,
  DURACION_BLOQUE_MIN,
  LETRAS_BLOQUE,
  fechaChile,
  formatoChile,
  inicioDiaUTC,
  type FechaChile,
} from '../../../utils/bloques'
import { estadoCasilla, nombreAlumno, type Casilla, type EstadoCasilla, type SesionSemana } from './estados'

interface Props {
  dias: FechaChile[]
  ramo: string
  casillas: Map<number, Casilla[]>
  sesiones: Map<number, SesionSemana[]>
  ahora: Date
  /** Inicio (ms) de la casilla con una acción en curso. */
  enCurso: number | null
  /** Muestra una capa de carga sobre la grilla. */
  cargando: boolean
  alElegir: (estado: EstadoCasilla) => void
}

/** "09:55–11:25" */
function rango(hora: string) {
  const [h, m] = hora.split(':').map(Number)
  const fin = h * 60 + m + DURACION_BLOQUE_MIN
  const dos = (n: number) => String(n).padStart(2, '0')
  return `${hora}–${dos(Math.floor(fin / 60))}:${dos(fin % 60)}`
}

/** Grilla de lunes a viernes por bloques A–F. */
export function GrillaSemana({ dias, ramo, casillas, sesiones, ahora, enCurso, cargando, alElegir }: Props) {
  const hoy = fechaChile(ahora)

  return (
    <div className="relative">
      <div className="-mx-1 overflow-x-auto px-1 pb-1">
        <div className="grid min-w-[44rem] grid-cols-[4.5rem_repeat(5,minmax(0,1fr))] gap-2">
          {/* Encabezado: días */}
          <div />
          {dias.map((dia) => {
            const esHoy = dia === hoy
            return (
              <div
                key={dia}
                className={`rounded-xl px-2 py-2 text-center ${esHoy ? 'bg-white/90 text-marca-700 shadow-sm dark:bg-tinta-800 dark:text-marca-200' : 'text-white'}`}
              >
                <p className="text-xs font-medium tracking-wide uppercase opacity-80">
                  {formatoChile(inicioDiaUTC(dia), 'EEEE')}
                </p>
                <p className="text-lg leading-tight font-bold">{formatoChile(inicioDiaUTC(dia), 'd MMM')}</p>
              </div>
            )
          })}

          {/* Filas: bloques */}
          {LETRAS_BLOQUE.map((letra) => (
            <Fila key={letra} letra={letra}>
              {dias.map((dia) => {
                const estado = estadoCasilla(dia, letra, ramo, casillas, sesiones, ahora)
                return (
                  <Celda
                    key={dia}
                    estado={estado}
                    enCurso={enCurso === estado.inicio.getTime()}
                    alElegir={alElegir}
                  />
                )
              })}
            </Fila>
          ))}
        </div>
      </div>

      {cargando && (
        <div className="absolute inset-0 grid place-items-center rounded-xl bg-marca-500/40 text-white backdrop-blur-[2px] dark:bg-tinta-900/40">
          <Cargando className="rounded-full bg-tinta-800/70 px-5 py-2.5 shadow-lg" />
        </div>
      )}
    </div>
  )
}

function Fila({ letra, children }: { letra: keyof typeof BLOQUES; children: React.ReactNode }) {
  return (
    <>
      <div className="flex flex-col justify-center rounded-xl bg-white/10 px-2 text-white">
        <span className="text-lg font-black leading-none">{letra}</span>
        <span className="mt-1 text-[0.7rem] leading-tight opacity-85">{rango(BLOQUES[letra])}</span>
      </div>
      {children}
    </>
  )
}

const BASE =
  'group relative flex min-h-[4.25rem] flex-col justify-center rounded-xl px-2.5 py-2 text-left text-xs transition duration-150'

function Celda({
  estado,
  enCurso,
  alElegir,
}: {
  estado: EstadoCasilla
  enCurso: boolean
  alElegir: (estado: EstadoCasilla) => void
}) {
  const contenido = (() => {
    switch (estado.tipo) {
      case 'libre':
        return {
          clase:
            'border border-dashed border-white/55 bg-white/10 text-white hover:-translate-y-0.5 hover:border-white hover:bg-white/25 dark:bg-white/5',
          titulo: '+ Marcar',
          detalle: 'Libre',
          ayuda: 'Marcar como disponible',
        }
      case 'disponible':
        return {
          clase:
            'bg-white text-marca-700 shadow-sm hover:-translate-y-0.5 hover:shadow-md dark:bg-tinta-800 dark:text-marca-200',
          titulo: 'Disponible',
          detalle: <span className="opacity-0 transition group-hover:opacity-100">Clic para desmarcar</span>,
          ayuda: 'Desmarcar',
        }
      case 'ocupada':
        return {
          clase:
            'cursor-not-allowed bg-tinta-800/25 text-white/80 bg-[repeating-linear-gradient(135deg,transparent_0_6px,rgb(255_255_255/0.08)_6px_12px)] dark:bg-black/30',
          titulo: estado.ramoCodigo,
          detalle: estado.reservada ? 'Reservada en otro ramo' : 'Marcada en otro ramo',
          ayuda: `Se cambia desde ${estado.ramoCodigo}`,
        }
      case 'pendiente':
        return {
          clase: 'bg-sol-300 text-sol-800 shadow-sm hover:-translate-y-0.5 hover:shadow-md',
          titulo: (
            <span className="flex items-center gap-1.5">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-marca-500 opacity-70" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-marca-600" />
              </span>
              Pendiente
            </span>
          ),
          detalle: nombreAlumno(estado.sesion),
          ayuda: 'Aceptar o rechazar',
        }
      case 'confirmada':
        return {
          clase: 'bg-acento-500 text-white shadow-sm hover:-translate-y-0.5 hover:bg-acento-600 hover:shadow-md',
          titulo: 'Confirmada',
          detalle: nombreAlumno(estado.sesion),
          ayuda: 'Ver o cancelar la sesión',
        }
      case 'pasada':
        return {
          clase: `cursor-default ${
            estado.sesion
              ? 'bg-acento-900/25 text-white/70 dark:bg-acento-900/40'
              : 'bg-tinta-800/15 text-white/45 dark:bg-black/20'
          }`,
          titulo: estado.sesion ? (estado.sesion.estado === 'FINALIZADA' ? 'Finalizada' : 'En curso') : '—',
          detalle: estado.sesion ? nombreAlumno(estado.sesion) : estado.casilla ? 'Sin reservas' : 'Pasada',
          ayuda: 'Ya empezó',
        }
    }
  })()

  const deshabilitada = estado.tipo === 'ocupada' || estado.tipo === 'pasada' || enCurso

  return (
    <button
      type="button"
      title={contenido.ayuda}
      aria-label={`${contenido.ayuda}`}
      disabled={deshabilitada}
      onClick={() => alElegir(estado)}
      className={`${BASE} ${contenido.clase} focus:outline-none focus-visible:ring-4 focus-visible:ring-white/70 disabled:hover:translate-y-0`}
    >
      <span className="font-bold">{contenido.titulo}</span>
      <span className="mt-0.5 truncate opacity-85">{contenido.detalle}</span>
      {enCurso && (
        <span className="absolute inset-0 grid place-items-center rounded-xl bg-black/15">
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
        </span>
      )}
    </button>
  )
}

/** Leyenda de colores bajo la grilla. */
export function Leyenda() {
  const items = [
    ['border border-dashed border-white/70 bg-white/10', 'Libre'],
    ['bg-white dark:bg-tinta-800', 'Disponible'],
    ['bg-sol-300', 'Pendiente'],
    ['bg-acento-500', 'Confirmada'],
    ['bg-tinta-800/30 dark:bg-black/30', 'Otra asignatura'],
    ['bg-tinta-800/15 dark:bg-black/20', 'Pasada'],
  ] as const
  return (
    <ul className="flex flex-wrap gap-x-4 gap-y-2 text-xs text-white/90">
      {items.map(([clase, texto]) => (
        <li key={texto} className="flex items-center gap-1.5">
          <span className={`h-3.5 w-3.5 rounded ${clase}`} />
          {texto}
        </li>
      ))}
    </ul>
  )
}
