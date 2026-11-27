import { describe, expect, it, vi } from 'vitest'
import { ALUMNO, tokenDePrueba } from '../test/utilidades'
import {
  actualizarSesion,
  guardarSesion,
  limpiarSesion,
  obtenerSesion,
  obtenerToken,
  suscribirSesion,
} from './sesion'

describe('sesión', () => {
  it('guarda, lee y limpia la sesión (también en localStorage)', () => {
    const token = tokenDePrueba()
    guardarSesion({ token, usuario: ALUMNO, portal: 'alumno' })
    expect(obtenerToken()).toBe(token)
    expect(JSON.parse(localStorage.getItem('tutormatch.sesion')!).usuario.id).toBe(ALUMNO.id)
    limpiarSesion()
    expect(obtenerSesion()).toBeNull()
    expect(localStorage.getItem('tutormatch.sesion')).toBeNull()
  })

  it('un token vencido (24 h) cuenta como sin sesión', () => {
    guardarSesion({ token: tokenDePrueba(-10), usuario: ALUMNO, portal: 'alumno' })
    expect(obtenerSesion()).toBeNull()
  })

  it('actualiza partes sin tocar el token', () => {
    const token = tokenDePrueba()
    guardarSesion({ token, usuario: ALUMNO, portal: 'alumno' })
    actualizarSesion({ portal: 'tutor', usuario: { ...ALUMNO, esTutor: true } })
    expect(obtenerSesion()).toMatchObject({ token, portal: 'tutor', usuario: { esTutor: true } })
  })

  it('avisa a los suscriptores y deja de avisar al desuscribirse', () => {
    const oyente = vi.fn()
    const quitar = suscribirSesion(oyente)
    guardarSesion({ token: tokenDePrueba(), usuario: ALUMNO, portal: 'alumno' })
    expect(oyente).toHaveBeenCalledTimes(1)
    quitar()
    limpiarSesion()
    expect(oyente).toHaveBeenCalledTimes(1)
  })

  it('se entera cuando otra pestaña cierra sesión', () => {
    guardarSesion({ token: tokenDePrueba(), usuario: ALUMNO, portal: 'alumno' })
    localStorage.removeItem('tutormatch.sesion')
    window.dispatchEvent(new StorageEvent('storage', { key: 'tutormatch.sesion' }))
    expect(obtenerSesion()).toBeNull()
  })
})
