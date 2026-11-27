import { useEffect, useRef, useState, type FormEvent, type KeyboardEvent } from 'react'
import { Link } from 'react-router-dom'
import { useApolloClient, useMutation } from '@apollo/client/react'
import { mensajeError } from '../../apollo/errores'
import { useSesion } from '../../auth/useSesion'
import { Avatar } from '../../components/Avatar'
import { Boton } from '../../components/Modal'
import { CHAT_AGENTE } from './operaciones'

// Chat con el agente de IA (`chatAgente`): busca tutores y horarios y puede
// crear la reserva. Cada respuesta puede tardar hasta unos 2 minutos, así
// que se muestra que está pensando y no se reintenta.

const MAXIMO = 2000

const EJEMPLOS = [
  'Necesito ayuda con Cálculo II el jueves en la tarde',
  '¿Quién tiene mejores reseñas en Programación Avanzada?',
  'Resérvame el primer horario libre de la próxima semana en Cálculo II',
]

interface Mensaje {
  id: number
  de: 'alumno' | 'agente'
  texto: string
  /** El agente creó una reserva con este mensaje. */
  reservo?: boolean
  error?: boolean
}

interface Conversacion {
  conversacionId: string | null
  mensajes: Mensaje[]
}

const VACIA: Conversacion = { conversacionId: null, mensajes: [] }

/** La conversación se guarda en la pestaña, para no perderla al cambiar de pantalla. */
function useConversacion(usuarioId: string) {
  const clave = `tutormatch.agente.${usuarioId}`
  const [conversacion, setConversacion] = useState<Conversacion>(() => {
    try {
      return (JSON.parse(sessionStorage.getItem(clave) ?? 'null') as Conversacion | null) ?? VACIA
    } catch {
      return VACIA
    }
  })
  useEffect(() => {
    try {
      sessionStorage.setItem(clave, JSON.stringify(conversacion))
    } catch {
      // Sin storage: dura mientras la pantalla esté abierta.
    }
  }, [clave, conversacion])
  return [conversacion, setConversacion] as const
}

export function Agente() {
  const usuario = useSesion()!.usuario
  const cliente = useApolloClient()
  const [conversacion, setConversacion] = useConversacion(usuario.id)
  const [texto, setTexto] = useState('')
  const [chat, { loading: pensando }] = useMutation(CHAT_AGENTE)
  const [segundos, setSegundos] = useState(0)
  const final = useRef<HTMLDivElement>(null)
  const entrada = useRef<HTMLTextAreaElement>(null)

  // Segundos de espera, para que se note que sigue trabajando.
  useEffect(() => {
    if (!pensando) return
    setSegundos(0)
    const t = setInterval(() => setSegundos((s) => s + 1), 1000)
    return () => clearInterval(t)
  }, [pensando])

  useEffect(() => {
    final.current?.scrollIntoView?.({ behavior: 'smooth', block: 'end' })
  }, [conversacion.mensajes.length, pensando])

  // Al terminar de pensar, el campo vuelve a estar habilitado: se le da el foco
  // para seguir escribiendo (antes no se puede, porque está deshabilitado).
  useEffect(() => {
    if (!pensando) entrada.current?.focus()
  }, [pensando])

  const agregar = (m: Omit<Mensaje, 'id'>) =>
    setConversacion((c) => ({ ...c, mensajes: [...c.mensajes, { ...m, id: Date.now() + Math.random() }] }))

  async function enviar(mensaje: string) {
    const limpio = mensaje.trim()
    if (!limpio || limpio.length > MAXIMO || pensando) return
    setTexto('')
    agregar({ de: 'alumno', texto: limpio })
    try {
      const { data } = await chat({
        variables: { mensaje: limpio, conversacionId: conversacion.conversacionId },
      })
      if (!data) return
      const { respuesta, conversacionId, acciones } = data.chatAgente
      const reservo = acciones.some((a) => a.tipo === 'sesion.creada')
      setConversacion((c) => ({
        conversacionId,
        mensajes: [...c.mensajes, { id: Date.now() + Math.random(), de: 'agente', texto: respuesta, reservo }],
      }))
      if (reservo) {
        // Se borran de la caché las sesiones y la disponibilidad: Reservas y
        // Mis tutorías las vuelven a pedir con la reserva nueva.
        cliente.cache.evict({ fieldName: 'sesiones' })
        cliente.cache.evict({ fieldName: 'buscarDisponibilidad' })
        cliente.cache.gc()
      }
    } catch (e) {
      agregar({
        de: 'agente',
        error: true,
        texto: mensajeError(e, {
          BAD_REQUEST: 'No pude entender ese mensaje. Prueba escribiéndolo de otra forma.',
          SERVICE_UNAVAILABLE: 'El agente no está disponible ahora. Intenta de nuevo en un rato.',
        }),
      })
      // Se devuelve el texto para que lo envíe de nuevo si quiere (no se reintenta solo).
      setTexto(limpio)
    }
  }

  function alEnviar(e: FormEvent) {
    e.preventDefault()
    void enviar(texto)
  }

  // Enter envía; Shift+Enter hace salto de línea.
  function alTeclear(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      void enviar(texto)
    }
  }

  function nuevaConversacion() {
    setConversacion(VACIA)
    setTexto('')
  }

  const vacia = conversacion.mensajes.length === 0
  const restantes = MAXIMO - texto.length

  return (
    <div className="flex h-[calc(100dvh-8.5rem)] min-h-[28rem] flex-col gap-4">
      <header className="flex flex-wrap items-center gap-3">
        <div className="mr-auto">
          <h1 className="text-3xl font-bold tracking-tight">Agente</h1>
          <p className="text-sm text-texto-suave">Busca tutores y horarios por ti, y puede hacer la reserva.</p>
        </div>
        {!vacia && (
          <Boton onClick={nuevaConversacion} disabled={pensando}>
            Nueva conversación
          </Boton>
        )}
      </header>

      <section className="tarjeta-marca flex min-h-0 flex-1 flex-col">
        <div className="min-h-0 flex-1 space-y-4 overflow-y-auto p-4 sm:p-6" aria-live="polite">
          {vacia ? (
            <Bienvenida alElegir={(e) => void enviar(e)} deshabilitado={pensando} />
          ) : (
            conversacion.mensajes.map((m) => <Burbuja key={m.id} mensaje={m} nombre={usuario.nombre} />)
          )}
          {pensando && <Pensando segundos={segundos} />}
          <div ref={final} />
        </div>

        <form onSubmit={alEnviar} className="border-t border-borde p-3 sm:p-4">
          <div className="flex items-end gap-2">
            <label htmlFor="mensaje-agente" className="sr-only">
              Mensaje para el agente
            </label>
            <textarea
              id="mensaje-agente"
              ref={entrada}
              rows={1}
              value={texto}
              onChange={(e) => setTexto(e.target.value)}
              onKeyDown={alTeclear}
              disabled={pensando}
              placeholder={pensando ? 'Esperando la respuesta…' : 'Escribe qué necesitas…'}
              className="max-h-40 min-h-12 flex-1 resize-y rounded-xl border border-borde bg-fondo px-4 py-3 text-texto outline-none placeholder:text-tinta-300 focus:border-marca-400 focus:ring-4 focus:ring-marca-200/50 disabled:opacity-60 dark:placeholder:text-tinta-500 dark:focus:ring-marca-800/50"
            />
            <button
              type="submit"
              disabled={pensando || !texto.trim() || restantes < 0}
              className="h-12 rounded-xl bg-marca-500 px-5 font-semibold text-white shadow-boton transition hover:-translate-y-0.5 hover:bg-marca-600 hover:shadow-boton-hover active:translate-y-0 disabled:pointer-events-none disabled:opacity-50"
            >
              Enviar
            </button>
          </div>
          <p className={`mt-1 text-right text-xs ${restantes < 0 ? 'font-semibold text-marca-700 dark:text-marca-300' : 'text-texto-suave'}`}>
            {restantes < 0 ? `Te pasaste por ${-restantes} caracteres` : `Enter para enviar · ${restantes} caracteres disponibles`}
          </p>
        </form>
      </section>
    </div>
  )
}

function IconoAgente() {
  return (
    <span aria-hidden className="bloque-marca grid h-10 w-10 shrink-0 place-items-center rounded-full text-white">
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={1.8}>
        <path
          strokeLinejoin="round"
          d="M4 5.5A2.5 2.5 0 0 1 6.5 3h11A2.5 2.5 0 0 1 20 5.5v8a2.5 2.5 0 0 1-2.5 2.5H10l-4.5 4v-4A2.5 2.5 0 0 1 4 13.5v-8Z"
        />
        <path strokeLinecap="round" d="M8.5 9.5h.01M12 9.5h.01M15.5 9.5h.01" strokeWidth={2.6} />
      </svg>
    </span>
  )
}

function Bienvenida({ alElegir, deshabilitado }: { alElegir: (ejemplo: string) => void; deshabilitado: boolean }) {
  return (
    <div className="mx-auto max-w-lg py-6 text-center">
      <div className="flex justify-center">
        <IconoAgente />
      </div>
      <h2 className="mt-3 text-xl font-bold">¿En qué te ayudo?</h2>
      <p className="mt-1 text-sm text-texto-suave">
        Cuéntame qué asignatura necesitas y cuándo puedes. Busco tutores y horarios, y si me lo pides, hago la reserva
        (queda pendiente hasta que el tutor la acepte).
      </p>
      <ul className="mt-5 space-y-2 text-left" aria-label="Ejemplos">
        {EJEMPLOS.map((e) => (
          <li key={e}>
            <button
              type="button"
              disabled={deshabilitado}
              onClick={() => alElegir(e)}
              className="w-full rounded-2xl rounded-bl-sm border border-borde bg-fondo/70 px-4 py-2.5 text-left text-sm text-texto-suave transition hover:border-marca-300 hover:text-texto disabled:opacity-50"
            >
              “{e}”
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}

function Burbuja({ mensaje, nombre }: { mensaje: Mensaje; nombre: string }) {
  if (mensaje.de === 'alumno') {
    return (
      <div className="flex animate-entrar justify-end gap-2">
        <p className="max-w-[80%] rounded-2xl rounded-br-sm bg-marca-500 px-4 py-2.5 whitespace-pre-line text-white shadow-sm">
          {mensaje.texto}
        </p>
        <Avatar nombre={nombre} tamano="sm" />
      </div>
    )
  }
  return (
    <div className="flex animate-entrar gap-2">
      <IconoAgente />
      <div
        className={`max-w-[80%] rounded-2xl rounded-bl-sm border px-4 py-2.5 shadow-sm ${
          mensaje.error
            ? 'border-marca-300 bg-marca-50 text-marca-900 dark:border-marca-700 dark:bg-marca-900/40 dark:text-marca-50'
            : 'border-borde bg-superficie text-texto'
        }`}
        role={mensaje.error ? 'alert' : undefined}
      >
        <p className="whitespace-pre-line">{mensaje.texto}</p>
        {mensaje.reservo && (
          <p className="mt-2 flex flex-wrap items-center gap-2 border-t border-borde pt-2 text-sm">
            <span className="rounded-full bg-sol-300 px-2 py-0.5 text-xs font-bold text-sol-800">Reserva creada</span>
            <Link to="/alumno/tutorias" className="font-semibold text-marca-700 hover:underline dark:text-marca-300">
              Ver en Mis tutorías
            </Link>
          </p>
        )}
      </div>
    </div>
  )
}

function Pensando({ segundos }: { segundos: number }) {
  return (
    <div className="flex gap-2" role="status">
      <IconoAgente />
      <div className="rounded-2xl rounded-bl-sm border border-borde bg-superficie px-4 py-3 shadow-sm">
        <p className="flex items-center gap-1.5" aria-hidden>
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className="h-2 w-2 animate-bounce rounded-full bg-marca-400"
              style={{ animationDelay: `${i * 150}ms` }}
            />
          ))}
        </p>
        <p className="mt-1.5 text-xs text-texto-suave">
          Pensando… {segundos}s
          {segundos >= 15 && ' · buscar y reservar puede tardar hasta 2 minutos'}
        </p>
      </div>
    </div>
  )
}
