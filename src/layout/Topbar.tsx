import { Link, NavLink, useNavigate } from 'react-router-dom'
import { actualizarSesion, limpiarSesion, type Portal } from '../auth/sesion'
import { useSesion } from '../auth/useSesion'

interface Enlace {
  a: string
  texto: string
}

const ENLACES: Record<Portal, Enlace[]> = {
  tutor: [
    { a: '/tutor', texto: 'Calendario' },
    { a: '/tutor/archivos', texto: 'Archivos' },
    { a: '/tutor/resenas', texto: 'Reseñas' },
    { a: '/tutor/perfil', texto: 'Perfil' },
  ],
  alumno: [
    { a: '/alumno', texto: 'Reservas' },
    { a: '/alumno/tutorias', texto: 'Mis tutorías' },
    { a: '/alumno/archivos', texto: 'Archivos' },
    { a: '/alumno/avisos', texto: 'Avisos' },
    { a: '/alumno/resenas', texto: 'Reseñas' },
    { a: '/alumno/agente', texto: 'Agente' },
    { a: '/alumno/perfil', texto: 'Perfil' },
  ],
}

/** Topbar común a los dos portales: logo, navegación, cambio de portal y salir. */
export function Topbar({ portal }: { portal: Portal }) {
  const sesion = useSesion()
  const navegar = useNavigate()
  const otroPortal: Portal = portal === 'tutor' ? 'alumno' : 'tutor'
  // El enlace al portal de tutor solo aparece si esTutor es verdadero.
  const puedeCambiar = otroPortal === 'alumno' || sesion?.usuario.esTutor

  function cambiarPortal() {
    actualizarSesion({ portal: otroPortal })
    navegar(`/${otroPortal}`)
  }

  function cerrarSesion() {
    limpiarSesion()
    navegar('/login', { replace: true })
  }

  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-6 gap-y-2 px-4 py-3">
        <Link to={`/${portal}`} className="flex items-center gap-2 font-semibold text-indigo-700">
          {/* Logo provisorio */}
          <span className="grid h-8 w-8 place-items-center rounded-md bg-indigo-600 text-sm text-white">
            TM
          </span>
          TutorMatch
        </Link>

        <nav className="flex flex-wrap gap-1">
          {ENLACES[portal].map((enlace) => (
            <NavLink
              key={enlace.a}
              to={enlace.a}
              end
              className={({ isActive }) =>
                `rounded-md px-3 py-1.5 text-sm ${
                  isActive ? 'bg-indigo-50 font-medium text-indigo-700' : 'text-slate-600 hover:bg-slate-100'
                }`
              }
            >
              {enlace.texto}
            </NavLink>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-3 text-sm">
          {puedeCambiar && (
            <button type="button" onClick={cambiarPortal} className="text-indigo-700 hover:underline">
              Ir al portal de {otroPortal}
            </button>
          )}
          {sesion && <span className="text-slate-500">{sesion.usuario.nombre}</span>}
          <button
            type="button"
            onClick={cerrarSesion}
            className="rounded-md border border-slate-300 px-3 py-1.5 hover:bg-slate-100"
          >
            Cerrar sesión
          </button>
        </div>
      </div>
    </header>
  )
}
