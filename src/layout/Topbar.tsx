import { Link, NavLink, useNavigate } from 'react-router-dom'
import { actualizarSesion, limpiarSesion, type Portal } from '../auth/sesion'
import { useSesion } from '../auth/useSesion'
import logo from '../assets/PLACEHOLDER.png'
import { BotonTema } from '../components/BotonTema'

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
    <header className="sticky top-0 z-10 border-b border-borde bg-superficie/80 shadow-sm backdrop-blur">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-6 gap-y-2 px-4 py-3">
        <Link to={`/${portal}`} className="flex items-center">
          {/* Logo provisorio; ver LayoutPublico para el truco del fondo blanco */}
          <img src={logo} alt="TutorMatch" className="h-10 w-auto mix-blend-multiply dark:invert dark:mix-blend-screen" />
        </Link>

        <nav className="flex flex-wrap gap-1">
          {ENLACES[portal].map((enlace) => (
            <NavLink
              key={enlace.a}
              to={enlace.a}
              end
              className={({ isActive }) =>
                `rounded-md px-3 py-1.5 text-sm ${
                  isActive ? 'bg-marca-100 font-medium text-marca-800 dark:bg-marca-900/60 dark:text-marca-200' : 'text-texto-suave hover:bg-marca-50 dark:hover:bg-tinta-700'
                }`
              }
            >
              {enlace.texto}
            </NavLink>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-3 text-sm">
          {puedeCambiar && (
            <button
              type="button"
              onClick={cambiarPortal}
              className="text-marca-700 underline-offset-2 hover:underline dark:text-marca-300"
            >
              Ir al portal de {otroPortal}
            </button>
          )}
          {sesion && <span className="text-texto-suave">{sesion.usuario.nombre}</span>}
          <BotonTema />
          <button
            type="button"
            onClick={cerrarSesion}
            className="rounded-md border border-borde px-3 py-1.5 hover:bg-marca-50 dark:hover:bg-tinta-700"
          >
            Cerrar sesión
          </button>
        </div>
      </div>
    </header>
  )
}
