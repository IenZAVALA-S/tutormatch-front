import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useMutation, useQuery } from '@apollo/client/react'
import { mensajeError } from '../../apollo/errores'
import { RAMOS } from '../../auth/operaciones'
import { useSesion } from '../../auth/useSesion'
import { Avatar } from '../../components/Avatar'
import { Cargando } from '../../components/Carga'
import { Boton } from '../../components/Modal'
import { Toasts, useToasts } from '../../components/Toasts'
import { describirInicio, fechaChile, formatoChile, inicioDiaUTC, sumarDias, type FechaChile } from '../../utils/bloques'
import { CANCELAR_SESION } from '../tutor/operaciones'
import { MIS_TUTORIAS } from './operaciones'
import { TarjetaHorario } from './reservas/TarjetaHorario'

/** El estado puede cambiar cuando el tutor acepta; se refresca cada minuto. */
const SONDEO_MS = 60_000

type Filtro = 'todas' | 'PENDIENTE' | 'CONFIRMADA'

const mayuscula = (texto: string) => texto.charAt(0).toUpperCase() + texto.slice(1)

/** "Hoy", "Mañana" o "Martes 1 de diciembre". */
function tituloDia(dia: FechaChile) {
  const hoy = fechaChile()
  if (dia === hoy) return 'Hoy'
  if (dia === sumarDias(hoy, 1)) return 'Mañana'
  return mayuscula(formatoChile(inicioDiaUTC(dia), "EEEE d 'de' MMMM"))
}

/** Próximas sesiones del alumno, con su estado y Cancelar. */
export function MisTutorias() {
  const yo = useSesion()!.usuario.id
  const { toasts, mostrar, cerrar } = useToasts()
  // "Desde ahora", fijado al entrar a la pantalla.
  const [desde] = useState(() => new Date().toISOString())
  const { data, loading, error } = useQuery(MIS_TUTORIAS, {
    variables: { estudianteId: yo, desde },
    pollInterval: SONDEO_MS,
    // Al entrar se consulta igual: pudo reservar o cancelar en Reservas.
    fetchPolicy: 'cache-and-network',
  })
  const { data: datosRamos } = useQuery(RAMOS)
  const nombres = useMemo(() => new Map((datosRamos?.ramos ?? []).map((r) => [r.codigo, r.nombre])), [datosRamos])
  const nombreRamo = (codigo: string) => nombres.get(codigo) ?? codigo

  const [cancelar] = useMutation(CANCELAR_SESION, { refetchQueries: ['MisTutorias'], awaitRefetchQueries: true })
  const [porCancelar, setPorCancelar] = useState<string | null>(null)
  const [cancelando, setCancelando] = useState<string | null>(null)
  const [filtro, setFiltro] = useState<Filtro>('todas')

  const proximas = useMemo(
    () =>
      (data?.sesiones ?? [])
        .filter((s) => s.estado === 'PENDIENTE' || s.estado === 'CONFIRMADA')
        .sort((a, b) => a.inicio.localeCompare(b.inicio)),
    [data],
  )
  const cuenta = {
    todas: proximas.length,
    PENDIENTE: proximas.filter((s) => s.estado === 'PENDIENTE').length,
    CONFIRMADA: proximas.filter((s) => s.estado === 'CONFIRMADA').length,
  }
  const visibles = filtro === 'todas' ? proximas : proximas.filter((s) => s.estado === filtro)
  const porDia = useMemo(() => {
    const grupos = new Map<FechaChile, typeof visibles>()
    for (const s of visibles) {
      const dia = fechaChile(s.inicio)
      grupos.set(dia, [...(grupos.get(dia) ?? []), s])
    }
    return [...grupos.entries()]
  }, [visibles])

  async function confirmarCancelar(id: string) {
    setCancelando(id)
    try {
      await cancelar({ variables: { id } })
      mostrar('Cancelaste la tutoría.')
    } catch (e) {
      mostrar(mensajeError(e), 'error')
    } finally {
      setCancelando(null)
      setPorCancelar(null)
    }
  }

  if (loading && !data) return <Cargando className="text-texto-suave" />
  if (error && !data) return <p className="text-marca-700 dark:text-marca-300">{mensajeError(error)}</p>

  const siguiente = proximas[0]

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Mis tutorías</h1>

      {siguiente ? (
        // La más próxima, destacada.
        <section className="bloque-marca flex flex-wrap items-center gap-4 rounded-2xl p-5 text-white sm:p-6">
          <Avatar nombre={siguiente.tutor?.nombre ?? '?'} />
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-marca-100">Tu próxima tutoría</p>
            <p className="truncate text-xl font-bold">
              {nombreRamo(siguiente.ramoCodigo)} con {siguiente.tutor?.nombre ?? `tutor ${siguiente.tutorId.slice(0, 8)}`}
            </p>
            <p className="text-marca-50">{describirInicio(siguiente.inicio)}</p>
          </div>
          <span
            className={`rounded-full px-3 py-1 text-sm font-bold ${
              siguiente.estado === 'CONFIRMADA' ? 'bg-acento-500 text-white' : 'bg-sol-300 text-sol-800'
            }`}
          >
            {siguiente.estado === 'CONFIRMADA' ? 'Confirmada' : 'Pendiente'}
          </span>
        </section>
      ) : null}

      <section className="tarjeta-marca space-y-5 p-4 sm:p-6">
        <header className="flex flex-wrap items-center gap-2">
          <h2 className="mr-auto text-xl font-bold">Próximas</h2>
          {(
            [
              ['todas', 'Todas'],
              ['PENDIENTE', 'Pendientes'],
              ['CONFIRMADA', 'Confirmadas'],
            ] as const
          ).map(([valor, texto]) => (
            <button
              key={valor}
              type="button"
              aria-pressed={filtro === valor}
              onClick={() => setFiltro(valor)}
              className={`rounded-full px-3 py-1 text-sm font-semibold transition ${
                filtro === valor
                  ? 'bg-marca-500 text-white shadow-sm'
                  : 'bg-marca-50 text-marca-700 hover:bg-marca-100 dark:bg-tinta-700 dark:text-marca-200 dark:hover:bg-tinta-600'
              }`}
            >
              {texto} ({cuenta[valor]})
            </button>
          ))}
        </header>

        {proximas.length === 0 ? (
          <div className="rounded-xl border-2 border-dashed border-borde px-6 py-12 text-center text-texto-suave">
            <p className="font-semibold text-texto">No tienes tutorías agendadas.</p>
            <Link
              to="/alumno"
              className="mt-2 inline-block font-semibold text-marca-700 hover:underline dark:text-marca-300"
            >
              Buscar horarios en Reservas
            </Link>
          </div>
        ) : visibles.length === 0 ? (
          <p className="py-6 text-center text-texto-suave">
            No tienes tutorías {filtro === 'PENDIENTE' ? 'pendientes' : 'confirmadas'}.
          </p>
        ) : (
          porDia.map(([dia, sesiones]) => (
            <div key={dia}>
              <h3 className="mb-2 text-xs font-bold tracking-wide text-texto-suave uppercase">{tituloDia(dia)}</h3>
              <ul className="space-y-2">
                {sesiones.map((s) => (
                  <TarjetaHorario
                    key={s.id}
                    inicio={s.inicio}
                    tutorId={s.tutorId}
                    tutor={s.tutor}
                    nombreRamo={nombreRamo(s.ramoCodigo)}
                    estado={s.estado as 'PENDIENTE' | 'CONFIRMADA'}
                    acciones={
                      porCancelar === s.id ? (
                        <>
                          <Boton onClick={() => setPorCancelar(null)} disabled={cancelando === s.id}>
                            No
                          </Boton>
                          <Boton tono="peligro" onClick={() => confirmarCancelar(s.id)} disabled={cancelando === s.id}>
                            {cancelando === s.id ? 'Cancelando…' : 'Sí, cancelar'}
                          </Boton>
                        </>
                      ) : (
                        <Boton onClick={() => setPorCancelar(s.id)}>Cancelar</Boton>
                      )
                    }
                  />
                ))}
              </ul>
            </div>
          ))
        )}
        <p className="text-xs text-texto-suave">
          Una reserva pendiente se cancela sola si el tutor no la acepta antes de que empiece.
        </p>
      </section>

      <Toasts toasts={toasts} alCerrar={cerrar} />
    </div>
  )
}
