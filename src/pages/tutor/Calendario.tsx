import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useMutation, useQuery } from '@apollo/client/react'
import { mensajeError } from '../../apollo/errores'
import { useSesion } from '../../auth/useSesion'
import { Cargando } from '../../components/Carga'
import { Boton, Modal } from '../../components/Modal'
import { SelectorAsignatura } from '../../components/SelectorAsignatura'
import { Toasts, useToasts } from '../../components/Toasts'
import {
  describirInicio,
  fechaChile,
  formatoChile,
  inicioDiaUTC,
  semanaChile,
  sumarDias,
  type FechaChile,
} from '../../utils/bloques'
import { GrillaSemana, Leyenda } from './calendario/GrillaSemana'
import { Notificaciones } from './calendario/Notificaciones'
import { indexar, nombreAlumno, type EstadoCasilla } from './calendario/estados'
import {
  CANCELAR_SESION,
  CONFIRMAR_SESION,
  DESMARCAR_CASILLA,
  MARCAR_CASILLA,
  MIS_RAMOS,
  PENDIENTES,
  SEMANA_TUTOR,
} from './operaciones'

/** Cada cuánto se consultan las reservas pendientes (no hay websockets). */
const SONDEO_MS = 30_000
/** Pequeña carga al cambiar de asignatura, para que se note el cambio. */
const CARGA_CAMBIO_MS = 350
const RECARGAR = { refetchQueries: ['SemanaTutor', 'Pendientes'], awaitRefetchQueries: true }

export function CalendarioTutor() {
  const tutorId = useSesion()!.usuario.id
  const { toasts, mostrar, cerrar } = useToasts()

  // ---- Asignatura elegida (en la URL: ?ramo=MAT1610) ----
  const [parametros, setParametros] = useSearchParams()
  const { data: datosRamos, loading: cargandoRamos, error: errorRamos } = useQuery(MIS_RAMOS)
  const activos = useMemo(
    () => (datosRamos?.yo.ramos ?? []).filter((r) => r.activo).map((r) => r.ramo),
    [datosRamos],
  )
  const nombres = useMemo(
    () => new Map((datosRamos?.yo.ramos ?? []).map((r) => [r.ramo.codigo, r.ramo.nombre])),
    [datosRamos],
  )
  const nombreRamo = useCallback((codigo: string) => nombres.get(codigo) ?? codigo, [nombres])
  const pedido = parametros.get('ramo')
  const ramo = activos.find((r) => r.codigo === pedido)?.codigo ?? activos[0]?.codigo ?? null

  const [cambiando, setCambiando] = useState(false)
  const tCambio = useRef<ReturnType<typeof setTimeout>>(undefined)
  function cambiarRamo(codigo: string) {
    setCambiando(true)
    setParametros({ ramo: codigo }, { replace: true })
    clearTimeout(tCambio.current)
    tCambio.current = setTimeout(() => setCambiando(false), CARGA_CAMBIO_MS)
  }

  // ---- Semana ----
  const [referencia, setReferencia] = useState(() => fechaChile())
  const semana = useMemo(() => semanaChile(referencia), [referencia])
  const [ahora, setAhora] = useState(() => new Date())
  useEffect(() => {
    const t = setInterval(() => setAhora(new Date()), 60_000)
    return () => clearInterval(t)
  }, [])

  const {
    data: datosSemana,
    previousData: semanaAnterior,
    loading: cargandoSemana,
    error: errorSemana,
    refetch: recargarSemana,
  } = useQuery(SEMANA_TUTOR, {
    variables: { tutorId, desde: semana.desde.toISOString(), hasta: semana.hasta.toISOString() },
  })
  const semanaVisible = datosSemana ?? semanaAnterior
  const casillas = useMemo(() => indexar(semanaVisible?.disponibilidad ?? []), [semanaVisible])
  const sesiones = useMemo(() => indexar(semanaVisible?.sesiones ?? []), [semanaVisible])

  // ---- Pendientes, con sondeo y toast de reserva nueva ----
  const { data: datosPendientes, loading: cargandoPendientes } = useQuery(PENDIENTES, {
    variables: { tutorId },
    pollInterval: SONDEO_MS,
  })
  const pendientes = useMemo(() => datosPendientes?.sesiones ?? [], [datosPendientes])
  const conocidas = useRef<Set<string> | null>(null)
  useEffect(() => {
    if (!datosPendientes) return
    const ids = new Set(pendientes.map((s) => s.id))
    if (conocidas.current) {
      const nuevas = pendientes.filter((s) => !conocidas.current!.has(s.id))
      for (const s of nuevas) {
        mostrar(`Nueva reserva: ${nombreAlumno(s)} en ${nombreRamo(s.ramoCodigo)}, ${describirInicio(s.inicio)}.`)
      }
      if (nuevas.length > 0) void recargarSemana()
    }
    conocidas.current = ids
  }, [datosPendientes, pendientes, mostrar, nombreRamo, recargarSemana])

  // ---- Acciones ----
  const [marcar] = useMutation(MARCAR_CASILLA, RECARGAR)
  const [desmarcar] = useMutation(DESMARCAR_CASILLA, RECARGAR)
  const [confirmar] = useMutation(CONFIRMAR_SESION, RECARGAR)
  const [cancelar] = useMutation(CANCELAR_SESION, RECARGAR)
  const [enCurso, setEnCurso] = useState<number | null>(null)
  const [sesionEnCurso, setSesionEnCurso] = useState<string | null>(null)
  const [elegida, setElegida] = useState<EstadoCasilla | null>(null)

  async function ejecutar(accion: () => Promise<unknown>, exito?: string) {
    try {
      await accion()
      if (exito) mostrar(exito)
    } catch (e) {
      mostrar(mensajeError(e), 'error')
    }
  }

  async function alElegir(estado: EstadoCasilla) {
    if (!ramo) return
    if (estado.tipo === 'pendiente' || estado.tipo === 'confirmada') return setElegida(estado)
    if (estado.tipo !== 'libre' && estado.tipo !== 'disponible') return
    setEnCurso(estado.inicio.getTime())
    await ejecutar(() =>
      estado.tipo === 'libre'
        ? marcar({ variables: { ramoCodigo: ramo, inicio: estado.inicio.toISOString() } })
        : desmarcar({ variables: { id: estado.casilla.id } }),
    )
    setEnCurso(null)
  }

  async function accionSesion(id: string, tipo: 'confirmar' | 'cancelar', exito: string) {
    setSesionEnCurso(id)
    await ejecutar(() => (tipo === 'confirmar' ? confirmar : cancelar)({ variables: { id } }), exito)
    setSesionEnCurso(null)
    setElegida(null)
  }

  // ---- Vista ----
  if (cargandoRamos) return <Cargando className="text-texto-suave" />
  if (errorRamos) return <p className="text-marca-700">{mensajeError(errorRamos)}</p>

  const sesionElegida = elegida?.tipo === 'pendiente' || elegida?.tipo === 'confirmada' ? elegida.sesion : null
  const viernes = semana.dias[4]

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Calendario</h1>

      <div className="grid gap-4 md:grid-cols-2">
        <section className="rounded-2xl border border-borde bg-superficie/90 p-4 shadow-sm backdrop-blur">
          {activos.length > 0 ? (
            <>
              <SelectorAsignatura opciones={activos} valor={ramo} alCambiar={cambiarRamo} />
              <p className="mt-3 text-sm text-texto-suave">
                Marca las casillas en que puedes hacer tutorías de esta asignatura. Una casilla marcada aquí deja de
                estar disponible para tus otros ramos.
              </p>
            </>
          ) : (
            <p className="text-sm text-texto-suave">
              No tienes ramos activos.{' '}
              <Link to="/tutor/perfil" className="font-semibold text-marca-700 hover:underline dark:text-marca-300">
                Agrega o reactiva uno en tu perfil
              </Link>
              .
            </p>
          )}
        </section>
        <Notificaciones
          pendientes={pendientes}
          cargando={cargandoPendientes}
          nombreRamo={nombreRamo}
          ocupada={sesionEnCurso}
          alAceptar={(id) => accionSesion(id, 'confirmar', 'Reserva aceptada.')}
          alRechazar={(id) => accionSesion(id, 'cancelar', 'Reserva rechazada.')}
        />
      </div>

      {ramo && (
        <section className="bloque-marca space-y-4 rounded-2xl p-4 text-white sm:p-6">
          <header className="flex flex-wrap items-center gap-3">
            <div className="mr-auto">
              <p className="text-sm font-medium text-white/80">{nombreRamo(ramo)}</p>
              <h2 className="text-xl font-bold">{tituloSemana(semana.dias[0], viernes)}</h2>
            </div>
            <nav className="flex items-center gap-2">
              <BotonSemana onClick={() => setReferencia((r) => sumarDias(r, -7))} aria-label="Semana anterior">
                ‹
              </BotonSemana>
              <BotonSemana onClick={() => setReferencia(fechaChile())} className="px-4 text-sm">
                Hoy
              </BotonSemana>
              <BotonSemana onClick={() => setReferencia((r) => sumarDias(r, 7))} aria-label="Semana siguiente">
                ›
              </BotonSemana>
            </nav>
          </header>

          {errorSemana && !semanaVisible ? (
            <p className="rounded-lg bg-white px-3 py-2 text-sm font-medium text-marca-800">{mensajeError(errorSemana)}</p>
          ) : (
            <GrillaSemana
              dias={semana.dias}
              ramo={ramo}
              casillas={casillas}
              sesiones={sesiones}
              ahora={ahora}
              enCurso={enCurso}
              cargando={cambiando || (cargandoSemana && !datosSemana)}
              alElegir={alElegir}
            />
          )}
          <Leyenda />
        </section>
      )}

      <Modal
        abierto={!!sesionElegida}
        titulo={elegida?.tipo === 'pendiente' ? 'Reserva pendiente' : 'Sesión confirmada'}
        alCerrar={() => setElegida(null)}
        acciones={
          sesionElegida &&
          (elegida?.tipo === 'pendiente' ? (
            <>
              <Boton
                tono="peligro"
                disabled={sesionEnCurso === sesionElegida.id}
                onClick={() => accionSesion(sesionElegida.id, 'cancelar', 'Reserva rechazada.')}
              >
                Rechazar
              </Boton>
              <Boton
                tono="acento"
                disabled={sesionEnCurso === sesionElegida.id}
                onClick={() => accionSesion(sesionElegida.id, 'confirmar', 'Reserva aceptada.')}
              >
                Aceptar
              </Boton>
            </>
          ) : (
            <>
              <Boton onClick={() => setElegida(null)}>Volver</Boton>
              <Boton
                tono="peligro"
                disabled={sesionEnCurso === sesionElegida.id}
                onClick={() => accionSesion(sesionElegida.id, 'cancelar', 'Sesión cancelada.')}
              >
                Cancelar sesión
              </Boton>
            </>
          ))
        }
      >
        {sesionElegida && (
          <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1.5">
            <dt>Alumno</dt>
            <dd className="font-semibold text-texto">{nombreAlumno(sesionElegida)}</dd>
            <dt>Asignatura</dt>
            <dd className="font-semibold text-texto">{nombreRamo(sesionElegida.ramoCodigo)}</dd>
            <dt>Horario</dt>
            <dd className="font-semibold text-texto">{describirInicio(sesionElegida.inicio)}</dd>
          </dl>
        )}
        {elegida?.tipo === 'confirmada' && (
          <p className="mt-4">Si la cancelas, el alumno la verá como cancelada y la casilla vuelve a quedar disponible.</p>
        )}
      </Modal>

      <Toasts toasts={toasts} alCerrar={cerrar} />
    </div>
  )
}

/** "Semana del 23 al 27 de noviembre" o "del 29 de diciembre al 2 de enero". */
function tituloSemana(lunes: FechaChile, viernes: FechaChile) {
  const dia = (f: FechaChile, patron: string) => formatoChile(inicioDiaUTC(f), patron)
  const mismoMes = lunes.slice(0, 7) === viernes.slice(0, 7)
  return `Semana del ${dia(lunes, mismoMes ? 'd' : "d 'de' MMMM")} al ${dia(viernes, "d 'de' MMMM")}`
}

function BotonSemana({ className = '', ...resto }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type="button"
      className={`grid h-10 min-w-10 place-items-center rounded-xl bg-white/15 text-lg font-bold text-white shadow-[inset_0_1px_0_rgb(255_255_255/0.25)] transition hover:-translate-y-0.5 hover:bg-white/30 active:translate-y-0 ${className}`}
      {...resto}
    />
  )
}
