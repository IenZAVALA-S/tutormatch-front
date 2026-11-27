import { describe, expect, it } from 'vitest'
import {
  bloqueDeInicio,
  describirInicio,
  diaSemana,
  esDiaHabil,
  esFutura,
  fechaChile,
  finBloqueUTC,
  formatoChile,
  horaChile,
  inicioBloqueUTC,
  inicioDiaUTC,
  mesChile,
  semanaChile,
  sumarDias,
} from './bloques'

describe('conversión de bloques a UTC (America/Santiago)', () => {
  it('en horario de verano (UTC−3) el bloque A del 24 de noviembre es 11:10Z', () => {
    expect(inicioBloqueUTC('2026-11-24', 'A').toISOString()).toBe('2026-11-24T11:10:00.000Z')
  })

  it('en horario de invierno (UTC−4) el mismo bloque es 12:10Z: no se suma un desfase fijo', () => {
    expect(inicioBloqueUTC('2026-06-15', 'A').toISOString()).toBe('2026-06-15T12:10:00.000Z')
  })

  it('el fin es 90 minutos después del inicio', () => {
    expect(finBloqueUTC('2026-11-24', 'F').toISOString()).toBe('2026-11-24T22:30:00.000Z')
  })

  it('reconoce el bloque de un inicio que viene del BFF', () => {
    expect(bloqueDeInicio('2026-11-24T12:55:00.000Z')).toEqual({ fecha: '2026-11-24', bloque: 'B' })
  })

  it('no reconoce horas que no son bloques ni fines de semana', () => {
    expect(bloqueDeInicio('2026-11-24T12:00:00.000Z')).toBeNull()
    expect(bloqueDeInicio('2026-11-28T11:10:00.000Z')).toBeNull() // sábado
  })
})

describe('fechas de calendario', () => {
  it('suma días cruzando meses y años', () => {
    expect(sumarDias('2026-12-30', 3)).toBe('2027-01-02')
    expect(sumarDias('2026-03-01', -1)).toBe('2026-02-28')
  })

  it('calcula el día de la semana ISO y si es hábil', () => {
    expect(diaSemana('2026-11-23')).toBe(1) // lunes
    expect(diaSemana('2026-11-29')).toBe(7) // domingo
    expect(esDiaHabil('2026-11-27')).toBe(true)
    expect(esDiaHabil('2026-11-28')).toBe(false)
  })

  it('la fecha en Chile puede ser distinta a la fecha UTC', () => {
    // 02:00 UTC del 25 son las 23:00 del 24 en Chile (verano).
    expect(fechaChile('2026-11-25T02:00:00.000Z')).toBe('2026-11-24')
  })

  it('la medianoche de Chile en UTC', () => {
    expect(inicioDiaUTC('2026-11-24').toISOString()).toBe('2026-11-24T03:00:00.000Z')
  })
})

describe('rangos para pedir al BFF', () => {
  it('la semana va de lunes a lunes siguiente, con los días hábiles', () => {
    const semana = semanaChile('2026-11-26')
    expect(semana.dias).toEqual(['2026-11-23', '2026-11-24', '2026-11-25', '2026-11-26', '2026-11-27'])
    expect(semana.desde.toISOString()).toBe('2026-11-23T03:00:00.000Z')
    expect(semana.hasta.toISOString()).toBe('2026-11-30T03:00:00.000Z')
  })

  it('el mes incluye todos sus días y termina el 1 del siguiente (excluido)', () => {
    const febrero = mesChile(2026, 2)
    expect(febrero.dias).toHaveLength(28)
    expect(febrero.hasta.toISOString()).toBe('2026-03-01T03:00:00.000Z')
    expect(mesChile(2026, 12).hasta.toISOString()).toBe('2027-01-01T03:00:00.000Z')
  })
})

describe('formatos', () => {
  it('formatea en español y en hora de Chile', () => {
    expect(formatoChile('2026-11-24T11:10:00.000Z', "EEEE d 'de' MMMM")).toBe('martes 24 de noviembre')
    expect(horaChile('2026-11-24T11:10:00.000Z')).toBe('08:10')
  })

  it('describe un inicio con su bloque', () => {
    expect(describirInicio('2026-11-24T11:10:00.000Z')).toBe('mar 24 nov · A 08:10')
    expect(describirInicio('2026-11-24T12:00:00.000Z')).toBe('mar 24 nov · 09:00')
  })

  it('distingue lo futuro de lo que ya empezó', () => {
    const ahora = new Date('2026-11-24T12:00:00.000Z')
    expect(esFutura('2026-11-24T12:55:00.000Z', ahora)).toBe(true)
    expect(esFutura('2026-11-24T11:10:00.000Z', ahora)).toBe(false)
  })
})
