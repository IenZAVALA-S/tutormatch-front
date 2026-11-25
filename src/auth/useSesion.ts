import { useSyncExternalStore } from 'react'
import { obtenerSesion, suscribirSesion, type Sesion } from './sesion'

/** Sesión actual; el componente se vuelve a renderizar cuando cambia. */
export function useSesion(): Sesion | null {
  return useSyncExternalStore(suscribirSesion, obtenerSesion)
}
