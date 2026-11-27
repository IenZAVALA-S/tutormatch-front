import { useCallback, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import type { Portal } from '../auth/sesion'
import { useSesion } from '../auth/useSesion'

// Asignatura elegida en una pantalla. Manda `?ramo=` de la URL (se puede
// compartir o guardar como marcador); si no viene, se usa la última que el
// usuario eligió en ese portal, guardada en este navegador.

function leer(clave: string): string | null {
  try {
    return localStorage.getItem(clave)
  } catch {
    return null
  }
}

function guardar(clave: string, codigo: string) {
  try {
    localStorage.setItem(clave, codigo)
  } catch {
    // Sin storage: solo se pierde el recuerdo.
  }
}

/**
 * Devuelve el código pedido (URL o el último recordado) y una función para
 * elegir otro. Cada pantalla valida el código contra sus opciones: si ya no
 * existe (ramo quitado, otro usuario), usa su propio valor por defecto.
 * Calendario y Archivos del tutor comparten el recuerdo.
 */
export function useRamoElegido(portal: Portal): [string | null, (codigo: string) => void] {
  const [parametros, setParametros] = useSearchParams()
  const usuario = useSesion()?.usuario.id ?? 'anonimo'
  const clave = `tutormatch.ramo.${portal}.${usuario}`
  const enUrl = parametros.get('ramo')

  // Lo que llega por URL (un enlace compartido, por ejemplo) también se recuerda.
  useEffect(() => {
    if (enUrl) guardar(clave, enUrl)
  }, [clave, enUrl])

  const elegir = useCallback(
    (codigo: string) => {
      guardar(clave, codigo)
      setParametros({ ramo: codigo }, { replace: true })
    },
    [clave, setParametros],
  )

  return [enUrl ?? leer(clave), elegir]
}
