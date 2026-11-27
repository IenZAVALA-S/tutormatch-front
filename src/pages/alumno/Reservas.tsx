import { useEffect, useMemo, useState } from 'react'
import { useMutation, useQuery } from '@apollo/client/react'
import { mensajeError } from '../../apollo/errores'
import { RAMOS } from '../../auth/operaciones'
import { useSesion } from '../../auth/useSesion'
import { Cargando } from '../../components/Carga'
import { Boton, Modal } from '../../components/Modal'
import { SelectorAsignatura } from '../../components/SelectorAsignatura'
import { Toasts, useToasts } from '../../components/Toasts'
import { useRamoElegido } from '../../hooks/useRamoElegido'
import { esFutura, fechaChile, formatoChile, inicioDiaUTC, mesChile, type FechaChile } from '../../utils/bloques'
import { CANCELAR_SESION } from '../tutor/operaciones'
import { CREAR_SESION, DISPONIBILIDAD_RAMO, MIS_RESERVAS } from './operaciones'
import { CalendarioMes, LeyendaMes, type ResumenDia } from './reservas/CalendarioMes'
import { TarjetaHorario, horarioCorto } from './reservas/TarjetaHorario'

const RECARGAR = { refetchQueries: ['DisponibilidadRamo', 'MisReservas'], awaitRefetchQueries: true }
const ACTIVAS = new Set(['PENDIENTE', 'CONFIRMADA'])

/** Año y mes (1–12) en hora de Chile. */
function mesActual(): { anio: number; mes: number } {
  const [anio, mes] = fechaChile().split('-').map(Number)
  return { anio, mes }
}

const mayuscula = (texto: string) => texto.charAt(0).toUpperCase() + texto.slice(1)

export function Reservas() {
  const yo = useSesion()!.usuario.id
  const { toasts, mostrar, cerrar } = useToasts()

  // ---- Asignatura (URL ?ramo=MAT1610, o la última elegida) ----
  const [pedido, elegirRamo] = useRamoElegido('alumno')
  const { data: datosRamos, loading: cargandoRamos, error: errorRamos } = useQuery(RAMOS)
  const catalogo = useMemo(() => datosRamos?.ramos ?? [], [datosRamos])
  const ramo = catalogo.find((r) => r.codigo === pedido) ?? null

  // ---- Mes ----
  const [{ anio, mes }, setMes] = useState(mesActual)
  const rango = useMemo(() => mesChile(anio, mes), [anio, mes])
  const esMesActual = anio === mesActual().anio && mes === mesActual().mes
  const moverMes = (delta: number) =>
    setMes(({ anio: a, mes: m }) => {
      const total = a * 12 + (m - 1) + delta
      return { anio: Math.floor(total / 12), mes: (total % 12) + 1 }
    })
  const [ahora, setAhora] = useState(() => new Date())
  useEffect(() => {
    const t = setInterval(() => setAhora(new Date()), 60_000)
    return () => clearInterval(t)
  }, [])

  // ---- Datos del mes ----
  const variables = { desde: rango.desde.toISOString(), hasta: rango.hasta.toISOString() }
  const disponibilidad = useQuery(DISPONIBILIDAD_RAMO, {
    variables: { ramoCodigo: ramo?.codigo ?? '', ...variables },
    skip: !ramo,
    fetchPolicy: 'cache-and-network',
  })
  const reservas = useQuery(MIS_RESERVAS, {
    variables: { estudianteId: yo, ...variables },
    skip: !ramo,
    // Al entrar se consulta igual: pudo reservar o cancelar en Mis tutorías.
    fetchPolicy: 'cache-and-network',
  })

  // Horarios libres y futuros, sin las casillas propias (nadie se reserva a sí mismo).
  const libres = useMemo(
    () =>
      ((disponibilidad.data ?? disponibilidad.previousData)?.buscarDisponibilidad ?? [])
        .filter((c) => c.tutorId !== yo && esFutura(c.inicio, ahora))
        .sort((a, b) => a.inicio.localeCompare(b.inicio)),
    [disponibilidad.data, disponibilidad.previousData, yo, ahora],
  )
  // Reservas propias activas y futuras en esta asignatura.
  const mias = useMemo(
    () =>
      ((reservas.data ?? reservas.previousData)?.sesiones ?? [])
        .filter((s) => s.ramoCodigo === ramo?.codigo && ACTIVAS.has(s.estado) && esFutura(s.inicio, ahora))
        .sort((a, b) => a.inicio.localeCompare(b.inicio)),
    [reservas.data, reservas.previousData, ramo, ahora],
  )
  // Horas en que el alumno ya tiene una sesión activa (de cualquier ramo): reservar ahí daría CONFLICT.
  const ocupadas = useMemo(
    () =>
      new Set(
        ((reservas.data ?? reservas.previousData)?.sesiones ?? [])
          .filter((s) => ACTIVAS.has(s.estado))
          .map((s) => new Date(s.inicio).getTime()),
      ),
    [reservas.data, reservas.previousData],
  )
  const resumen = useMemo(() => {
    const mapa = new Map<FechaChile, ResumenDia>()
    const de = (dia: FechaChile) => mapa.get(dia) ?? mapa.set(dia, { libres: 0, pendientes: 0, confirmadas: 0 }).get(dia)!
    for (const c of libres) de(fechaChile(c.inicio)).libres++
    for (const s of mias) {
      if (s.estado === 'PENDIENTE') de(fechaChile(s.inicio)).pendientes++
      else de(fechaChile(s.inicio)).confirmadas++
    }
    return mapa
  }, [libres, mias])
  const totalLibres = libres.length

  // ---- Popup del día y acciones ----
  const [dia, setDia] = useState<FechaChile | null>(null)
  const libresDia = dia ? libres.filter((c) => fechaChile(c.inicio) === dia) : []
  const miasDia = dia ? mias.filter((s) => fechaChile(s.inicio) === dia) : []
  const [crear] = useMutation(CREAR_SESION, RECARGAR)
  const [cancelar] = useMutation(CANCELAR_SESION, RECARGAR)
  const [enCurso, setEnCurso] = useState<string | null>(null)
  const [porCancelar, setPorCancelar] = useState<string | null>(null)

  async function inscribirme(casilla: (typeof libres)[number]) {
    if (!ramo) return
    setEnCurso(casilla.id)
    try {
      await crear({ variables: { input: { tutorId: casilla.tutorId, ramoCodigo: ramo.codigo, inicio: casilla.inicio } } })
      mostrar(`Reserva enviada para el ${horarioCorto(casilla.inicio)}. Queda pendiente hasta que el tutor la acepte.`)
    } catch (e) {
      // CONFLICT: cruce de horario u horario ya tomado; el BFF explica cuál.
      mostrar(mensajeError(e), 'error')
    } finally {
      setEnCurso(null)
    }
  }

  async function cancelarReserva(id: string) {
    setEnCurso(id)
    try {
      await cancelar({ variables: { id } })
      mostrar('Cancelaste la reserva.')
    } catch (e) {
      mostrar(mensajeError(e), 'error')
    } finally {
      setEnCurso(null)
      setPorCancelar(null)
    }
  }

  // ---- Vista ----
  if (cargandoRamos) return <Cargando className="text-texto-suave" />
  if (errorRamos) return <p className="text-marca-700 dark:text-marca-300">{mensajeError(errorRamos)}</p>


  // Primero se elige la asignatura: sin ella no hay calendario.
  if (!ramo) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold tracking-tight">Reservas</h1>
        <section className="tarjeta-marca mx-auto max-w-xl p-6 text-center sm:p-10">
          <p className="text-2xl font-bold">¿En qué asignatura necesitas ayuda?</p>
          <p className="mt-2 text-texto-suave">Elige una para ver los horarios de sus tutores este mes.</p>
          <SelectorAsignatura
            opciones={catalogo}
            valor={null}
            alCambiar={elegirRamo}
            vacio="Elige una asignatura…"
            sinEtiqueta
            className="mx-auto mt-6 max-w-sm text-left"
          />
        </section>
      </div>
    )
  }

  const cargando = (disponibilidad.loading && !disponibilidad.data) || (reservas.loading && !reservas.data)
  const errorMes = disponibilidad.error ?? reservas.error

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end gap-4">
        <div className="mr-auto min-w-0">
          <p className="text-sm font-semibold text-marca-600 dark:text-marca-300">Reservas</p>
          <h1 className="truncate text-3xl font-bold tracking-tight">{ramo.nombre}</h1>
        </div>
        <SelectorAsignatura
          opciones={catalogo}
          valor={ramo.codigo}
          alCambiar={elegirRamo}
          etiqueta="Cambiar asignatura"
          className="w-full sm:w-80"
        />
      </header>

      <section className="tarjeta-marca space-y-4 p-4 sm:p-6">
        <header className="flex flex-wrap items-center gap-3">
          <div className="mr-auto">
            <h2 className="text-xl font-bold">
              {mayuscula(formatoChile(inicioDiaUTC(rango.dias[0]), "MMMM 'de' yyyy"))}
            </h2>
            <p className="text-sm text-texto-suave">
              {cargando
                ? 'Buscando horarios…'
                : totalLibres === 0
                  ? 'No hay horarios disponibles este mes.'
                  : `${totalLibres} ${totalLibres === 1 ? 'horario disponible' : 'horarios disponibles'}. Elige un día.`}
            </p>
          </div>
          <nav className="flex items-center gap-2">
            <BotonMes onClick={() => moverMes(-1)} disabled={esMesActual} aria-label="Mes anterior">
              ‹
            </BotonMes>
            <BotonMes onClick={() => setMes(mesActual())} className="px-4 text-sm">
              Hoy
            </BotonMes>
            <BotonMes onClick={() => moverMes(1)} aria-label="Mes siguiente">
              ›
            </BotonMes>
          </nav>
        </header>

        {errorMes && !disponibilidad.data ? (
          <p className="rounded-lg bg-marca-50 px-3 py-2 text-sm font-medium text-marca-800 dark:bg-marca-900/40 dark:text-marca-100">
            {mensajeError(errorMes)}
          </p>
        ) : (
          <CalendarioMes dias={rango.dias} resumen={resumen} ahora={ahora} cargando={cargando} alElegir={setDia} />
        )}
        <LeyendaMes />
      </section>

      <Modal
        abierto={!!dia}
        ancho="lg"
        titulo={dia ? mayuscula(formatoChile(inicioDiaUTC(dia), "EEEE d 'de' MMMM")) : ''}
        subtitulo={ramo.nombre}
        alCerrar={() => {
          setDia(null)
          setPorCancelar(null)
        }}
      >
        {miasDia.length > 0 && (
          <>
            <h3 className="mb-2 text-xs font-bold tracking-wide uppercase">Tus reservas</h3>
            <ul className="mb-5 space-y-2">
              {miasDia.map((s) => (
                <TarjetaHorario
                  key={s.id}
                  inicio={s.inicio}
                  tutorId={s.tutorId}
                  tutor={s.tutor}
                  nombreRamo={ramo.nombre}
                  estado={s.estado as 'PENDIENTE' | 'CONFIRMADA'}
                  acciones={
                    porCancelar === s.id ? (
                      <>
                        <Boton onClick={() => setPorCancelar(null)} disabled={enCurso === s.id}>
                          No
                        </Boton>
                        <Boton tono="peligro" onClick={() => cancelarReserva(s.id)} disabled={enCurso === s.id}>
                          {enCurso === s.id ? 'Cancelando…' : 'Sí, cancelar'}
                        </Boton>
                      </>
                    ) : (
                      <Boton onClick={() => setPorCancelar(s.id)}>Cancelar</Boton>
                    )
                  }
                />
              ))}
            </ul>
          </>
        )}

        <h3 className="mb-2 text-xs font-bold tracking-wide uppercase">Horarios disponibles</h3>
        {libresDia.length === 0 ? (
          <p className="rounded-xl border-2 border-dashed border-borde px-4 py-6 text-center">
            No quedan horarios libres este día.
          </p>
        ) : (
          <ul className="space-y-2">
            {libresDia.map((c) => (
              <TarjetaHorario
                key={c.id}
                inicio={c.inicio}
                tutorId={c.tutorId}
                tutor={c.tutor}
                nombreRamo={ramo.nombre}
                acciones={
                  ocupadas.has(new Date(c.inicio).getTime()) ? (
                    <span className="self-center text-xs font-semibold">Ya tienes una sesión a esta hora</span>
                  ) : (
                    <Boton tono="peligro" disabled={enCurso !== null} onClick={() => inscribirme(c)}>
                      {enCurso === c.id ? 'Inscribiendo…' : 'Inscribirme'}
                    </Boton>
                  )
                }
              />
            ))}
          </ul>
        )}
      </Modal>

      <Toasts toasts={toasts} alCerrar={cerrar} />
    </div>
  )
}

function BotonMes({ className = '', ...resto }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type="button"
      className={`grid h-10 min-w-10 place-items-center rounded-xl border border-borde bg-marca-50 text-lg font-bold text-marca-700 transition hover:-translate-y-0.5 hover:bg-marca-100 active:translate-y-0 disabled:pointer-events-none disabled:opacity-40 dark:bg-tinta-700 dark:text-marca-200 dark:hover:bg-tinta-600 ${className}`}
      {...resto}
    />
  )
}
