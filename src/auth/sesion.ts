// Sesión del usuario: token JWT + datos básicos, guardados en localStorage.
// Es un store externo a React para que el link de Apollo y las utilidades
// de /archivos puedan leer el token y limpiarlo sin depender de componentes.

import type { UsuarioSesionFragment } from '../gql/graphql'

/**
 * Datos del usuario que guardamos al iniciar sesión (fragmento
 * `UsuarioSesion` de `operaciones.ts`). `esTutor` solo decide qué portal
 * se muestra; los permisos los valida el back.
 */
export type UsuarioSesion = UsuarioSesionFragment

export type Portal = 'tutor' | 'alumno'

export interface Sesion {
  token: string
  usuario: UsuarioSesion
  /** Último portal elegido (botón de ingreso o cambio desde la topbar). */
  portal: Portal
}

const CLAVE = 'tutormatch.sesion'

type Oyente = () => void
const oyentes = new Set<Oyente>()

let cache: Sesion | null | undefined

/** Segundos de expiración del JWT (`exp`), o null si no se puede leer. */
function expiracionToken(token: string): number | null {
  try {
    const payload = token.split('.')[1]
    if (!payload) return null
    const json = atob(payload.replace(/-/g, '+').replace(/_/g, '/'))
    const exp = (JSON.parse(json) as { exp?: unknown }).exp
    return typeof exp === 'number' ? exp : null
  } catch {
    return null
  }
}

function vencido(token: string): boolean {
  const exp = expiracionToken(token)
  return exp !== null && exp * 1000 <= Date.now()
}

function leerDeStorage(): Sesion | null {
  try {
    const crudo = localStorage.getItem(CLAVE)
    if (!crudo) return null
    const sesion = JSON.parse(crudo) as Sesion
    if (!sesion?.token || !sesion.usuario) return null
    return sesion
  } catch {
    return null
  }
}

function avisar() {
  for (const oyente of oyentes) oyente()
}

/** Sesión actual, o null si no hay o el token venció (24 h). */
export function obtenerSesion(): Sesion | null {
  if (cache === undefined) cache = leerDeStorage()
  if (cache && vencido(cache.token)) {
    limpiarSesion()
    return null
  }
  return cache
}

/**
 * A dónde ir con una sesión: el portal elegido, salvo que eligió tutor sin
 * serlo todavía, que va al formulario de ramos.
 */
export function destinoInicial(sesion: Sesion): string {
  if (sesion.portal === 'tutor' && !sesion.usuario.esTutor) return '/inscripcion-tutor'
  return `/${sesion.portal}`
}

export function obtenerToken(): string | null {
  return obtenerSesion()?.token ?? null
}

export function guardarSesion(sesion: Sesion) {
  cache = sesion
  try {
    localStorage.setItem(CLAVE, JSON.stringify(sesion))
  } catch {
    // Sin storage (modo privado, etc.): la sesión vive solo en memoria.
  }
  avisar()
}

/** Actualiza parte de la sesión (por ejemplo, el portal o `esTutor`). */
export function actualizarSesion(cambios: Partial<Omit<Sesion, 'token'>>) {
  const actual = obtenerSesion()
  if (!actual) return
  guardarSesion({ ...actual, ...cambios })
}

export function limpiarSesion() {
  if (cache === null) return
  cache = null
  try {
    localStorage.removeItem(CLAVE)
  } catch {
    // nada
  }
  avisar()
}

export function suscribirSesion(oyente: Oyente): () => void {
  oyentes.add(oyente)
  return () => oyentes.delete(oyente)
}

// Otra pestaña inició o cerró sesión.
window.addEventListener('storage', (evento) => {
  if (evento.key !== CLAVE) return
  cache = leerDeStorage()
  avisar()
})
