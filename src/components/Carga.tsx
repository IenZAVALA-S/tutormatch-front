import { useEffect, useState } from 'react'
import { useNavigation } from 'react-router-dom'

/**
 * Barra fina arriba de la pantalla mientras se cambia de página.
 * Aparece tras un instante (para no parpadear en cambios instantáneos) y,
 * una vez visible, dura un mínimo para que se alcance a ver.
 */
export function BarraCarga() {
  const navegando = useNavigation().state !== 'idle'
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (navegando) {
      const t = setTimeout(() => setVisible(true), 120)
      return () => clearTimeout(t)
    }
    const t = setTimeout(() => setVisible(false), 350)
    return () => clearTimeout(t)
  }, [navegando])

  return (
    <div
      role="progressbar"
      aria-hidden={!visible}
      aria-label="Cargando página"
      className={`pointer-events-none fixed inset-x-0 top-0 z-50 h-1 overflow-hidden transition-opacity duration-300 ${
        visible ? 'opacity-100' : 'opacity-0'
      }`}
    >
      <div className="h-full w-2/5 animate-carga rounded-full bg-linear-to-r from-marca-400 via-marca-500 to-acento-500" />
    </div>
  )
}

/** Indicador de carga para el contenido de una página o un bloque. */
export function Cargando({ texto = 'Cargando…', className = '' }: { texto?: string; className?: string }) {
  return (
    <div role="status" className={`flex items-center justify-center gap-3 py-10 text-sm ${className}`}>
      <span className="h-5 w-5 animate-spin rounded-full border-2 border-current border-t-transparent opacity-70" />
      {texto}
    </div>
  )
}

/** Pantalla completa mientras carga la primera página. */
export function CargaInicial() {
  return (
    <div className="grid min-h-screen place-items-center text-texto-suave">
      <Cargando />
    </div>
  )
}
