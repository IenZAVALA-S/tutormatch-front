import type { SemanaTutorQuery } from '../../../gql/graphql'
import { esFutura, inicioBloqueUTC, type Bloque, type FechaChile } from '../../../utils/bloques'

export type Casilla = SemanaTutorQuery['disponibilidad'][number]
export type SesionSemana = SemanaTutorQuery['sesiones'][number]

/** Estados de una casilla del calendario del tutor (ver docs/flujo.md). */
export type EstadoCasilla =
  | { tipo: 'libre'; inicio: Date }
  | { tipo: 'disponible'; inicio: Date; casilla: Casilla }
  | { tipo: 'ocupada'; inicio: Date; ramoCodigo: string; reservada: boolean }
  | { tipo: 'pendiente'; inicio: Date; sesion: SesionSemana }
  | { tipo: 'confirmada'; inicio: Date; sesion: SesionSemana }
  | { tipo: 'pasada'; inicio: Date; sesion?: SesionSemana; casilla?: Casilla }

const ACTIVA = new Set(['PENDIENTE', 'CONFIRMADA'])

/** Índice por instante de inicio (ms), para cruzar con la grilla. */
export function indexar<T extends { inicio: string }>(lista: T[]): Map<number, T[]> {
  const mapa = new Map<number, T[]>()
  for (const item of lista) {
    const clave = new Date(item.inicio).getTime()
    mapa.set(clave, [...(mapa.get(clave) ?? []), item])
  }
  return mapa
}

/**
 * Decide qué se ve en una casilla. Orden: pasada → sesión activa →
 * casilla marcada → libre. Lo de otra asignatura se ve como "ocupada".
 */
export function estadoCasilla(
  fecha: FechaChile,
  bloque: Bloque,
  ramo: string,
  casillas: Map<number, Casilla[]>,
  sesiones: Map<number, SesionSemana[]>,
  ahora: Date,
): EstadoCasilla {
  const inicio = inicioBloqueUTC(fecha, bloque)
  const clave = inicio.getTime()
  const casilla = casillas.get(clave)?.[0]
  const delBloque = sesiones.get(clave) ?? []
  const activa = delBloque.find((s) => ACTIVA.has(s.estado))

  if (!esFutura(inicio, ahora)) {
    // En el pasado mostramos lo que hubo (confirmada o finalizada) si era de este ramo.
    const sesion = delBloque.find((s) => s.estado !== 'CANCELADA' && s.ramoCodigo === ramo)
    return { tipo: 'pasada', inicio, sesion, casilla: casilla?.ramoCodigo === ramo ? casilla : undefined }
  }
  if (activa) {
    if (activa.ramoCodigo !== ramo) return { tipo: 'ocupada', inicio, ramoCodigo: activa.ramoCodigo, reservada: true }
    return activa.estado === 'PENDIENTE'
      ? { tipo: 'pendiente', inicio, sesion: activa }
      : { tipo: 'confirmada', inicio, sesion: activa }
  }
  if (casilla) {
    return casilla.ramoCodigo === ramo
      ? { tipo: 'disponible', inicio, casilla }
      : { tipo: 'ocupada', inicio, ramoCodigo: casilla.ramoCodigo, reservada: false }
  }
  return { tipo: 'libre', inicio }
}

/** Nombre del alumno, o su id si el back no lo trae. */
export function nombreAlumno(sesion: { estudiante?: { nombre: string } | null; estudianteId: string }) {
  return sesion.estudiante?.nombre ?? `Alumno ${sesion.estudianteId.slice(0, 8)}`
}
