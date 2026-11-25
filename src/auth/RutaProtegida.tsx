import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useSesion } from './useSesion'

/**
 * Exige sesión. Sin sesión (o si el link de Apollo la limpió por
 * `UNAUTHENTICATED`) vuelve al login.
 */
export function RutaProtegida() {
  const sesion = useSesion()
  const ubicacion = useLocation()
  if (!sesion) return <Navigate to="/login" replace state={{ desde: ubicacion.pathname }} />
  return <Outlet />
}

/** Portal del tutor: si todavía no es tutor, va al formulario de ramos. */
export function RutaTutor() {
  const sesion = useSesion()
  if (sesion && !sesion.usuario.esTutor) return <Navigate to="/inscripcion-tutor" replace />
  return <Outlet />
}
