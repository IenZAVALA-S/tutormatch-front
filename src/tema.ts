// Modo claro / oscuro. Por defecto sigue al sistema; si el usuario elige
// uno, se recuerda en localStorage. Se aplica con la clase `dark` en <html>.

import { useSyncExternalStore } from 'react'

export type Tema = 'claro' | 'oscuro'

const CLAVE = 'tutormatch.tema'
const consulta = window.matchMedia('(prefers-color-scheme: dark)')
const oyentes = new Set<() => void>()

function elegido(): Tema | null {
  try {
    const valor = localStorage.getItem(CLAVE)
    return valor === 'claro' || valor === 'oscuro' ? valor : null
  } catch {
    return null
  }
}

export function temaActual(): Tema {
  return elegido() ?? (consulta.matches ? 'oscuro' : 'claro')
}

function aplicar() {
  document.documentElement.classList.toggle('dark', temaActual() === 'oscuro')
  for (const oyente of oyentes) oyente()
}

export function cambiarTema(tema: Tema) {
  try {
    localStorage.setItem(CLAVE, tema)
  } catch {
    // Sin storage: dura hasta recargar.
    document.documentElement.classList.toggle('dark', tema === 'oscuro')
    return
  }
  aplicar()
}

export function useTema(): Tema {
  return useSyncExternalStore(
    (oyente) => {
      oyentes.add(oyente)
      return () => oyentes.delete(oyente)
    },
    temaActual,
  )
}

consulta.addEventListener('change', aplicar)
aplicar()
