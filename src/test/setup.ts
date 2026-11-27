// Preparación común de los tests (Vitest + Testing Library).
import '@testing-library/jest-dom/vitest'
import { cleanup } from '@testing-library/react'
import { afterEach, vi } from 'vitest'
import { limpiarSesion } from '../auth/sesion'

// jsdom no trae matchMedia, y src/tema.ts lo usa al cargarse.
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: (consulta: string) => ({
    matches: false,
    media: consulta,
    onchange: null,
    addEventListener: () => {},
    removeEventListener: () => {},
    addListener: () => {},
    removeListener: () => {},
    dispatchEvent: () => false,
  }),
})

afterEach(() => {
  cleanup()
  limpiarSesion()
  localStorage.clear()
  vi.useRealTimers()
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
})
