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
import { nombreAlumno, type EstadoCasilla } from './estados'

interface Props {
  dias: FechaChile[]
  ahora: Date
  /** Estados de los bloques A–F de un día, en orden. */
  estadosDia: (dia: FechaChile) => EstadoCasilla[]
  /** Inicios (ms) de las casillas con una acción en curso. */
  enCurso: Set<number>
  /** Muestra una capa de carga sobre la grilla. */
  cargando: boolean
  alElegir: (estado: EstadoCasilla) => void
  /** Marcar todo el día (o desmarcarlo si ya no queda nada libre). */
  alAccionDia: (dia: FechaChile) => void
}

/** "09:55–11:25" */
function rango(hora: string) {
  const [h, m] = hora.split(':').map(Number)
  const fin = h * 60 + m + DURACION_BLOQUE_MIN
  const dos = (n: number) => String(n).padStart(2, '0')
  return `${hora}–${dos(Math.floor(fin / 60))}:${dos(fin % 60)}`
}

/** Grilla de lunes a viernes por bloques A–F. */
export function GrillaSemana({ dias, ahora, estadosDia, enCurso, cargando, alElegir, alAccionDia }: Props) {
  const hoy = fechaChile(ahora)
  const porDia = new Map(dias.map((dia) => [dia, estadosDia(dia)]))
  const ocupado = enCurso.size > 0

  return (
    <div className="relative">
      <div className="-mx-1 overflow-x-auto px-1 pb-1">
        <div className="grid min-w-[44rem] grid-cols-[4.5rem_repeat(5,minmax(0,1fr))] gap-2">
          {/* Encabezado: días */}
          <div />
          {dias.map((dia) => {
            const esHoy = dia === hoy
            const estados = porDia.get(dia) ?? []
            const libres = estados.filter((e) => e.tipo === 'libre').length
            const disponibles = estados.filter((e) => e.tipo === 'disponible').length
            // Si queda algo libre se ofrece marcarlo todo; si no, desmarcar lo disponible.
            const accion = libres > 0 ? 'Marcar día' : disponibles > 0 ? 'Desmarcar día' : null
            const nombreDia = formatoChile(inicioDiaUTC(dia), "EEEE d 'de' MMMM")
            return (
              <div
                key={dia}
                className={`flex flex-col items-center rounded-xl px-2 pt-2 pb-1.5 text-center ${esHoy ? 'bg-marca-500 text-white shadow-sm' : 'text-texto-suave'}`}
              >
                <p className="text-xs font-medium tracking-wide uppercase opacity-80">
                  {formatoChile(inicioDiaUTC(dia), 'EEEE')}
                </p>
                <p className="text-lg leading-tight font-bold">{formatoChile(inicioDiaUTC(dia), 'd MMM')}</p>
                {accion ? (
                  <button
                    type="button"
                    disabled={ocupado}
                    onClick={() => alAccionDia(dia)}
                    title={
                      libres > 0
                        ? `Marcar los ${libres} bloques libres del ${nombreDia}`
                        : `Desmarcar los ${disponibles} bloques disponibles del ${nombreDia}`
                    }
                    className={`mt-1.5 rounded-full px-2.5 py-0.5 text-[0.7rem] font-semibold transition hover:-translate-y-px active:translate-y-0 disabled:pointer-events-none disabled:opacity-50 ${
                      esHoy
                        ? 'bg-white/20 text-white hover:bg-white/35'
                        : 'bg-marca-50 text-marca-700 hover:bg-marca-100 dark:bg-tinta-700 dark:text-marca-200 dark:hover:bg-tinta-600'
                    }`}
                  >
                    {accion}
                  </button>
                ) : (
                  // Reserva el espacio para que los encabezados queden alineados.
                  <span className="mt-1.5 h-5" aria-hidden />
                )}
              </div>
            )
          })}

          {/* Filas: bloques */}
          {LETRAS_BLOQUE.map((letra, i) => (
            <Fila key={letra} letra={letra}>
              {dias.map((dia) => {
                const estado = porDia.get(dia)![i]
                return (
                  <Celda
                    key={dia}
                    estado={estado}
                    enCurso={enCurso.has(estado.inicio.getTime())}
                    alElegir={alElegir}
                  />
                )
              })}
            </Fila>
          ))}
        </div>
      </div>

      {cargando && (
        <div className="absolute inset-0 grid place-items-center rounded-xl bg-superficie/50 text-white backdrop-blur-[2px]">
          <Cargando className="rounded-full bg-tinta-800/70 px-5 py-2.5 shadow-lg" />
        </div>
      )}
    </div>
  )
}

function Fila({ letra, children }: { letra: keyof typeof BLOQUES; children: React.ReactNode }) {
  return (
    <>
      <div className="flex flex-col justify-center rounded-xl bg-marca-50 px-2 text-marca-800 dark:bg-tinta-700 dark:text-marca-200">
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
            'border border-dashed border-marca-200 text-texto-suave hover:-translate-y-0.5 hover:border-marca-400 hover:bg-marca-50 hover:text-marca-700 dark:border-tinta-600 dark:hover:border-marca-500 dark:hover:bg-tinta-700 dark:hover:text-marca-200',
          titulo: '+ Marcar',
          detalle: 'Libre',
          ayuda: 'Marcar como disponible',
        }
      case 'disponible':
        return {
          clase: 'bg-marca-500 text-white shadow-sm hover:-translate-y-0.5 hover:bg-marca-600 hover:shadow-md',
          titulo: 'Disponible',
          detalle: <span className="opacity-0 transition group-hover:opacity-100">Clic para desmarcar</span>,
          ayuda: 'Desmarcar',
        }
      case 'ocupada':
        return {
          clase:
            'cursor-not-allowed bg-tinta-100 text-tinta-500 bg-[repeating-linear-gradient(135deg,transparent_0_6px,rgb(0_0_0/0.05)_6px_12px)] dark:bg-tinta-700 dark:text-tinta-300 dark:bg-[repeating-linear-gradient(135deg,transparent_0_6px,rgb(255_255_255/0.05)_6px_12px)]',
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
      case 'pasada': {
        // Confirmada que ya empezó: se puede finalizar desde aquí.
        const enCursoConfirmada = estado.sesion?.estado === 'CONFIRMADA'
        return {
          clase: enCursoConfirmada
            ? 'bg-acento-100 text-acento-800 ring-2 ring-acento-400 hover:-translate-y-0.5 hover:shadow-md dark:bg-acento-900/60 dark:text-acento-100'
            : `cursor-default ${
                estado.sesion
                  ? 'bg-acento-50 text-acento-700 dark:bg-acento-900/40 dark:text-acento-200'
                  : 'bg-tinta-50 text-tinta-300 dark:bg-tinta-900/60 dark:text-tinta-500'
              }`,
          titulo: estado.sesion ? (estado.sesion.estado === 'FINALIZADA' ? 'Finalizada' : 'En curso') : '—',
          detalle: estado.sesion ? nombreAlumno(estado.sesion) : estado.casilla ? 'Sin reservas' : 'Pasada',
          ayuda: enCursoConfirmada
            ? 'Finalizar la sesión'
            : estado.sesion?.estado === 'FINALIZADA'
              ? 'Sesión finalizada'
              : 'Ya empezó',
        }
      }
    }
  })()

  const deshabilitada =
    estado.tipo === 'ocupada' ||
    (estado.tipo === 'pasada' && estado.sesion?.estado !== 'CONFIRMADA') ||
    enCurso

  return (
    <button
      type="button"
      title={contenido.ayuda}
      aria-label={`${contenido.ayuda}`}
      disabled={deshabilitada}
      onClick={() => alElegir(estado)}
      className={`${BASE} ${contenido.clase} focus:outline-none focus-visible:ring-4 focus-visible:ring-marca-300/70 disabled:hover:translate-y-0`}
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
    ['border border-dashed border-marca-300 dark:border-tinta-500', 'Libre'],
    ['bg-marca-500', 'Disponible'],
    ['bg-sol-300', 'Pendiente'],
    ['bg-acento-500', 'Confirmada'],
    ['bg-tinta-200 dark:bg-tinta-600', 'Otra asignatura'],
    ['bg-tinta-50 border border-tinta-100 dark:bg-tinta-900 dark:border-tinta-700', 'Pasada'],
  ] as const
  return (
    <ul className="flex flex-wrap gap-x-4 gap-y-2 text-xs text-texto-suave">
      {items.map(([clase, texto]) => (
        <li key={texto} className="flex items-center gap-1.5">
          <span className={`h-3.5 w-3.5 rounded ${clase}`} />
          {texto}
        </li>
      ))}
    </ul>
  )
}
