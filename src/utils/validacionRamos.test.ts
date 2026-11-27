import { describe, expect, it } from 'vitest'
import { validarNota, validarPeriodo } from './validacionRamos'

const error = (r: { ok: boolean; error?: string }) => (r.ok ? null : r.error)

describe('validarPeriodo', () => {
  it.each([
    ['', 'Falta el periodo'],
    ['3', 'Falta el año'],
    ['2025', 'Falta el semestre'],
    ['2025-3', 'El semestre solo puede ser 1 o 2 (pusiste 3)'],
    ['2025-0', 'El semestre solo puede ser 1 o 2 (pusiste 0)'],
    ['25-2', 'El año debe tener 4 dígitos'],
    ['20252', 'Separa el año y el semestre con un guion: 2025-2'],
    ['2027-1', 'El año 2027 todavía no llega'],
    ['1975-1', 'parece demasiado antiguo'],
    ['abc', 'El periodo va como año-semestre'],
  ])('"%s" → %s', (texto, mensaje) => {
    expect(error(validarPeriodo(texto, 2026))).toContain(mensaje)
  })

  it.each([
    ['2025-2', '2025-2'],
    [' 2026-1 ', '2026-1'],
    ['2025/2', '2025-2'],
    ['2025 2', '2025-2'],
    ['2025-02', '2025-2'],
  ])('acepta "%s" y lo guarda como %s', (texto, valor) => {
    expect(validarPeriodo(texto, 2026)).toEqual({ ok: true, valor })
  })
})

describe('validarNota', () => {
  it.each([
    ['', 'Falta la nota'],
    ['seis', 'Escribe la nota con números'],
    ['62', '¿quisiste decir 6.2?'],
    ['3.9', 'Con nota bajo 4.0'],
    ['7.5', 'La nota máxima es 7.0'],
    ['6.25', 'Usa un solo decimal'],
  ])('"%s" → %s', (texto, mensaje) => {
    expect(error(validarNota(texto))).toContain(mensaje)
  })

  it.each([
    ['6,2', 6.2],
    ['4', 4],
    ['7.0', 7],
  ])('acepta "%s" como %s', (texto, valor) => {
    expect(validarNota(texto)).toEqual({ ok: true, valor })
  })
})
