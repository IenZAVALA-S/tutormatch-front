// Validación del formulario de ramos (inscripción como tutor). Cada regla
// devuelve un mensaje que dice exactamente qué está mal, no solo "formato
// incorrecto". El back vuelve a validar; esto es para ayudar a llenarlo.

import { fechaChile } from './bloques'

export type Resultado<T> = { ok: true; valor: T } | { ok: false; error: string }

const EJEMPLO_PERIODO = 'por ejemplo 2025-2'

/**
 * Periodo de aprobación: año y semestre, "2025-2". Acepta "2025/2",
 * "2025 2" o "2025-02" y los normaliza a "2025-2".
 */
export function validarPeriodo(texto: string, anioActual = Number(fechaChile().slice(0, 4))): Resultado<string> {
  const limpio = texto.trim()
  if (!limpio) return { ok: false, error: `Falta el periodo, ${EJEMPLO_PERIODO}.` }

  // Solo el año: falta el semestre.
  if (/^\d{4}$/.test(limpio)) {
    return { ok: false, error: `Falta el semestre: agrega -1 o -2 al año (${limpio}-1 o ${limpio}-2).` }
  }
  // Solo un número corto: probablemente puso solo el semestre.
  if (/^\d{1,2}$/.test(limpio)) {
    return { ok: false, error: `Falta el año: el periodo va como año-semestre, ${EJEMPLO_PERIODO}.` }
  }
  // Año y semestre pegados: "20252".
  if (/^\d{5}$/.test(limpio)) {
    return { ok: false, error: `Separa el año y el semestre con un guion: ${limpio.slice(0, 4)}-${limpio[4]}.` }
  }

  const partes = limpio.match(/^(\d+)\s*[-/\s]\s*(\d+)$/)
  if (!partes) return { ok: false, error: `El periodo va como año-semestre, ${EJEMPLO_PERIODO}.` }

  const [, anioTexto, semestreTexto] = partes
  if (anioTexto.length !== 4) return { ok: false, error: `El año debe tener 4 dígitos, como 2025 (pusiste ${anioTexto}).` }

  const semestre = Number(semestreTexto)
  if (semestre !== 1 && semestre !== 2) {
    return { ok: false, error: `El semestre solo puede ser 1 o 2 (pusiste ${semestreTexto}).` }
  }

  const anio = Number(anioTexto)
  if (anio > anioActual) return { ok: false, error: `El año ${anio} todavía no llega.` }
  if (anio < 1980) return { ok: false, error: `Revisa el año: ${anio} parece demasiado antiguo.` }

  return { ok: true, valor: `${anio}-${semestre}` }
}

/** Nota de aprobación en escala chilena: de 4.0 a 7.0, con un decimal. Acepta coma. */
export function validarNota(texto: string): Resultado<number> {
  const limpio = texto.trim().replace(',', '.')
  if (!limpio) return { ok: false, error: 'Falta la nota.' }
  if (!/^\d+(\.\d+)?$/.test(limpio)) return { ok: false, error: 'Escribe la nota con números, por ejemplo 6.2.' }

  const nota = Number(limpio)
  // Escala 10–70 (sin punto): se sugiere la versión con decimal.
  if (nota >= 10 && nota <= 70 && Number.isInteger(nota)) {
    return { ok: false, error: `La nota va de 1.0 a 7.0; ¿quisiste decir ${(nota / 10).toFixed(1)}?` }
  }
  if (nota > 7) return { ok: false, error: 'La nota máxima es 7.0.' }
  if (nota < 4) return { ok: false, error: 'Con nota bajo 4.0 el ramo no queda aprobado.' }
  if ((limpio.split('.')[1]?.length ?? 0) > 1) return { ok: false, error: 'Usa un solo decimal, por ejemplo 6.2.' }

  return { ok: true, valor: nota }
}
