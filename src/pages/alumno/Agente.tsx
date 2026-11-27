import { Link } from 'react-router-dom'

/** Ejemplos de lo que se le podrá pedir (solo de muestra). */
const EJEMPLOS = [
  'Necesito ayuda con Cálculo II el jueves en la tarde',
  '¿Quién tiene mejores reseñas en Programación Avanzada?',
  'Resérvame el primer horario libre de la próxima semana',
]

/**
 * Agente de tutorías: por ahora "próximamente". El BFF ya tiene
 * `chatAgente` (ver CLAUDE.md); se decidió dejar el chat para más adelante.
 */
export function Agente() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Agente</h1>

      <section className="tarjeta-marca mx-auto max-w-2xl p-6 text-center sm:p-10">
        <span aria-hidden className="bloque-marca mx-auto grid h-20 w-20 place-items-center rounded-3xl text-white">
          <svg viewBox="0 0 24 24" className="h-10 w-10" fill="none" stroke="currentColor" strokeWidth={1.8}>
            <path
              strokeLinejoin="round"
              d="M4 5.5A2.5 2.5 0 0 1 6.5 3h11A2.5 2.5 0 0 1 20 5.5v8a2.5 2.5 0 0 1-2.5 2.5H10l-4.5 4v-4h0A2.5 2.5 0 0 1 4 13.5v-8Z"
            />
            <path strokeLinecap="round" d="M8.5 9.5h.01M12 9.5h.01M15.5 9.5h.01" strokeWidth={2.6} />
          </svg>
        </span>
        <p className="mt-5 inline-block rounded-full bg-sol-100 px-3 py-1 text-xs font-bold tracking-wide text-sol-800 uppercase dark:bg-sol-800/30 dark:text-sol-200">
          Próximamente
        </p>
        <h2 className="mt-3 text-2xl font-bold">Tu agente de tutorías</h2>
        <p className="mx-auto mt-2 max-w-md text-texto-suave">
          Un asistente con inteligencia artificial que busca tutores y horarios por ti, y hace la reserva cuando
          encuentra uno que te sirva.
        </p>

        <ul className="mx-auto mt-6 max-w-md space-y-2 text-left" aria-label="Ejemplos de lo que podrás pedirle">
          {EJEMPLOS.map((e) => (
            <li
              key={e}
              className="rounded-2xl rounded-bl-sm border border-borde bg-fondo/70 px-4 py-2.5 text-sm text-texto-suave"
            >
              “{e}”
            </li>
          ))}
        </ul>

        <p className="mt-8 text-sm text-texto-suave">Mientras tanto, puedes buscar y reservar tú mismo.</p>
        <Link
          to="/alumno"
          className="mt-3 inline-block rounded-full bg-marca-500 px-5 py-2.5 font-semibold text-white shadow-boton transition hover:-translate-y-0.5 hover:bg-marca-600 hover:shadow-boton-hover"
        >
          Ir a Reservas
        </Link>
      </section>
    </div>
  )
}
