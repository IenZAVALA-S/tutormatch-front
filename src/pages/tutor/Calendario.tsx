import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { useRamoElegido } from '../../hooks/useRamoElegido'
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
  LETRAS_BLOQUE,
  semanaChile,
  sumarDias,
  type FechaChile,
} from '../../utils/bloques'
import { GrillaSemana, Leyenda } from './calendario/GrillaSemana'
import { Notificaciones } from './calendario/Notificaciones'
import { estadoCasilla, indexar, nombreAlumno, type EstadoCasilla } from './calendario/estados'
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

  // ---- Asignatura elegida (URL ?ramo=MAT1610, o la última elegida) ----
  const [pedido, elegirRamo] = useRamoElegido('tutor')
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
  const ramo = activos.find((r) => r.codigo === pedido)?.codigo ?? activos[0]?.codigo ?? null

  const [cambiando, setCambiando] = useState(false)
  const tCambio = useRef<ReturnType<typeof setTimeout>>(undefined)
  function cambiarRamo(codigo: string) {
    setCambiando(true)
    elegirRamo(codigo)
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

  /** Estados de los bloques A–F de un día, para la asignatura elegida. */
  const estadosDia = useCallback(
    (dia: FechaChile) =>
      ramo ? LETRAS_BLOQUE.map((letra) => estadoCasilla(dia, letra, ramo, casillas, sesiones, ahora)) : [],
    [ramo, casillas, sesiones, ahora],
  )

  // Resumen de la semana en la asignatura elegida.
  const resumen = useMemo(() => {
    const cuenta = { disponibles: 0, pendientes: 0, confirmadas: 0 }
    for (const e of semana.dias.flatMap(estadosDia)) {
      if (e.tipo === 'disponible') cuenta.disponibles++
      else if (e.tipo === 'pendiente') cuenta.pendientes++
      else if (e.tipo === 'confirmada') cuenta.confirmadas++
    }
    return cuenta
  }, [semana, estadosDia])

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
  /** Inicios (ms) de las casillas con una acción en curso. */
  const [enCurso, setEnCurso] = useState<Set<number>>(() => new Set())
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
    setEnCurso(new Set([estado.inicio.getTime()]))
    await ejecutar(() =>
      estado.tipo === 'libre'
        ? marcar({ variables: { ramoCodigo: ramo, inicio: estado.inicio.toISOString() } })
        : desmarcar({ variables: { id: estado.casilla.id } }),
    )
    setEnCurso(new Set())
  }

  /**
   * Marca todos los bloques libres de un día; si no queda ninguno libre,
   * desmarca los disponibles (los reservados no se tocan). El BFF no tiene
   * una operación por día, así que se hace casilla por casilla y se recarga
   * la semana una sola vez al final.
   */
  async function accionDia(dia: FechaChile) {
    if (!ramo) return
    const estados = estadosDia(dia)
    const libres = estados.filter((e) => e.tipo === 'libre')
    const disponibles = estados.flatMap((e) => (e.tipo === 'disponible' ? [e] : []))
    const marcando = libres.length > 0
    const objetivo = marcando ? libres : disponibles
    if (objetivo.length === 0) return

    setEnCurso(new Set(objetivo.map((e) => e.inicio.getTime())))
    let fallas = 0
    let ultimoError: unknown = null
    for (const e of objetivo) {
      try {
        if (marcando) {
          await marcar({ variables: { ramoCodigo: ramo, inicio: e.inicio.toISOString() }, refetchQueries: [] })
        } else if (e.tipo === 'disponible') {
          await desmarcar({ variables: { id: e.casilla.id }, refetchQueries: [] })
        }
      } catch (error) {
        fallas++
        ultimoError = error
      }
    }
    await recargarSemana()
    setEnCurso(new Set())

    const nombreDia = formatoChile(inicioDiaUTC(dia), "EEEE d 'de' MMMM")
    const hechas = objetivo.length - fallas
    if (hechas > 0) {
      mostrar(
        `${marcando ? 'Marcaste' : 'Desmarcaste'} ${hechas} ${hechas === 1 ? 'horario' : 'horarios'} del ${nombreDia}.`,
      )
    }
    if (fallas > 0) mostrar(`${fallas} no se pudieron cambiar: ${mensajeError(ultimoError)}`, 'error')
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
        <section className="flex flex-col gap-4 rounded-2xl border border-borde bg-superficie/90 p-5 shadow-sm backdrop-blur md:h-56">
          <h2 className="font-semibold">Asignatura</h2>
          {activos.length > 0 ? (
            <>
              <SelectorAsignatura opciones={activos} valor={ramo} alCambiar={cambiarRamo} sinEtiqueta />
              <ul aria-label="Esta semana" className="flex flex-wrap gap-2 text-xs font-semibold">
                <Pastilla className="bg-marca-100 text-marca-800 dark:bg-marca-900/50 dark:text-marca-200">
                  {resumen.disponibles} {resumen.disponibles === 1 ? 'disponible' : 'disponibles'}
                </Pastilla>
                <Pastilla className="bg-sol-100 text-sol-800 dark:bg-sol-800/30 dark:text-sol-200">
                  {resumen.pendientes} {resumen.pendientes === 1 ? 'pendiente' : 'pendientes'}
                </Pastilla>
                <Pastilla className="bg-acento-100 text-acento-700 dark:bg-acento-900/50 dark:text-acento-200">
                  {resumen.confirmadas} {resumen.confirmadas === 1 ? 'confirmada' : 'confirmadas'}
                </Pastilla>
                <li className="self-center font-normal text-texto-suave">esta semana</li>
              </ul>
              <p className="mt-auto text-sm leading-relaxed text-texto-suave">
                Una casilla marcada aquí deja de estar disponible para tus otros ramos.
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
        <section className="space-y-4 tarjeta-marca p-4 sm:p-6">
          <header className="flex flex-wrap items-center gap-3">
            <div className="mr-auto">
              <p className="text-sm font-semibold text-marca-600 dark:text-marca-300">{nombreRamo(ramo)}</p>
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
            <p className="rounded-lg bg-marca-50 px-3 py-2 text-sm font-medium text-marca-800 dark:bg-marca-900/40 dark:text-marca-100">
              {mensajeError(errorSemana)}
            </p>
          ) : (
            <GrillaSemana
              dias={semana.dias}
              ahora={ahora}
              enCurso={enCurso}
              estadosDia={estadosDia}
              alAccionDia={accionDia}
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

function Pastilla({ className, children }: { className: string; children: React.ReactNode }) {
  return <li className={`rounded-full px-2.5 py-1 ${className}`}>{children}</li>
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
      className={`grid h-10 min-w-10 place-items-center rounded-xl border border-borde bg-marca-50 text-lg font-bold text-marca-700 transition hover:-translate-y-0.5 hover:bg-marca-100 active:translate-y-0 dark:bg-tinta-700 dark:text-marca-200 dark:hover:bg-tinta-600 ${className}`}
      {...resto}
    />
  )
}
