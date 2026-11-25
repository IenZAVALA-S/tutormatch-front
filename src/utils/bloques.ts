// Bloques horarios de la universidad y conversión hora de Chile ↔ UTC.
// El BFF recibe y devuelve UTC. Toda conversión pasa por la zona
// America/Santiago con date-fns-tz; nunca se suma un número fijo de horas,
// porque el desfase cambia con el horario de verano.

import { formatInTimeZone, fromZonedTime } from 'date-fns-tz'

export const ZONA_CHILE = 'America/Santiago'

/** Inicio de cada bloque en hora de Chile. Todos duran 90 minutos. */
export const BLOQUES = {
  A: '08:10',
  B: '09:55',
  C: '11:40',
  D: '14:30',
  E: '16:15',
  F: '18:00',
} as const

export type Bloque = keyof typeof BLOQUES

export const LETRAS_BLOQUE = Object.keys(BLOQUES) as Bloque[]

export const DURACION_BLOQUE_MIN = 90

/** Fecha de calendario en Chile, formato `yyyy-MM-dd`. */
export type FechaChile = string

const MS_DIA = 24 * 60 * 60 * 1000

// ---- Aritmética de fechas de calendario (sin hora ni zona) ----
// Se hace en UTC puro para que el huso del navegador no influya.

function aUTCMedianoche(fecha: FechaChile): number {
  const [a, m, d] = fecha.split('-').map(Number)
  return Date.UTC(a, m - 1, d)
}

function deUTCMedianoche(ms: number): FechaChile {
  return new Date(ms).toISOString().slice(0, 10)
}

export function sumarDias(fecha: FechaChile, dias: number): FechaChile {
  return deUTCMedianoche(aUTCMedianoche(fecha) + dias * MS_DIA)
}

/** Día de la semana ISO: 1 = lunes … 7 = domingo. */
export function diaSemana(fecha: FechaChile): number {
  const dia = new Date(aUTCMedianoche(fecha)).getUTCDay()
  return dia === 0 ? 7 : dia
}

export function esDiaHabil(fecha: FechaChile): boolean {
  return diaSemana(fecha) <= 5
}

// ---- Conversión Chile ↔ UTC ----

/** Fecha de calendario en Chile de un instante (por defecto, ahora). */
export function fechaChile(instante: Date | string = new Date()): FechaChile {
  return formatInTimeZone(instante, ZONA_CHILE, 'yyyy-MM-dd')
}

/** Medianoche de Chile de una fecha, como instante UTC. */
export function inicioDiaUTC(fecha: FechaChile): Date {
  return fromZonedTime(`${fecha}T00:00:00`, ZONA_CHILE)
}

/** Inicio de un bloque (fecha de Chile + letra) como instante UTC. */
export function inicioBloqueUTC(fecha: FechaChile, bloque: Bloque): Date {
  return fromZonedTime(`${fecha}T${BLOQUES[bloque]}:00`, ZONA_CHILE)
}

/** Fin de un bloque: inicio + 90 minutos reales. */
export function finBloqueUTC(fecha: FechaChile, bloque: Bloque): Date {
  return new Date(inicioBloqueUTC(fecha, bloque).getTime() + DURACION_BLOQUE_MIN * 60 * 1000)
}

/**
 * Qué bloque es un inicio que viene del BFF (UTC).
 * Devuelve null si no calza con ningún bloque de lunes a viernes.
 */
export function bloqueDeInicio(inicio: Date | string): { fecha: FechaChile; bloque: Bloque } | null {
  const fecha = fechaChile(inicio)
  if (!esDiaHabil(fecha)) return null
  const hora = horaChile(inicio)
  const bloque = LETRAS_BLOQUE.find((letra) => BLOQUES[letra] === hora)
  return bloque ? { fecha, bloque } : null
}

/** Hora de Chile para mostrar, por ejemplo `08:10`. */
export function horaChile(instante: Date | string): string {
  return formatInTimeZone(instante, ZONA_CHILE, 'HH:mm')
}

/** Solo se aceptan casillas futuras. */
export function esFutura(inicio: Date | string, ahora: Date = new Date()): boolean {
  return new Date(inicio).getTime() > ahora.getTime()
}

// ---- Rangos para pedir al BFF (desde incluido, hasta excluido) ----

export interface Rango {
  desde: Date
  hasta: Date
}

export interface Semana extends Rango {
  /** Lunes a viernes, en hora de Chile. */
  dias: FechaChile[]
}

/** Semana (de lunes a lunes siguiente, en Chile) que contiene la fecha dada. */
export function semanaChile(fecha: FechaChile = fechaChile()): Semana {
  const lunes = sumarDias(fecha, 1 - diaSemana(fecha))
  return {
    dias: [0, 1, 2, 3, 4].map((i) => sumarDias(lunes, i)),
    desde: inicioDiaUTC(lunes),
    hasta: inicioDiaUTC(sumarDias(lunes, 7)),
  }
}

/** Mes completo en Chile. `mes` va de 1 a 12. */
export function mesChile(anio: number, mes: number): Rango & { dias: FechaChile[] } {
  const primero = deUTCMedianoche(Date.UTC(anio, mes - 1, 1))
  const siguiente = deUTCMedianoche(Date.UTC(anio, mes, 1))
  const cantidad = Math.round((aUTCMedianoche(siguiente) - aUTCMedianoche(primero)) / MS_DIA)
  return {
    dias: Array.from({ length: cantidad }, (_, i) => sumarDias(primero, i)),
    desde: inicioDiaUTC(primero),
    hasta: inicioDiaUTC(siguiente),
  }
}
