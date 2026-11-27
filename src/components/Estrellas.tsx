import { useState } from 'react'

/** Una estrella de 5 puntas en un cuadro de 20×20. */
const ESTRELLA = 'M10 1.5l2.6 5.3 5.9.9-4.3 4.1 1 5.8L10 14.9l-5.2 2.7 1-5.8L1.5 7.7l5.9-.9L10 1.5z'

interface Props {
  /** De 0 a 5; acepta decimales (se rellena la fracción). */
  valor: number
  tamano?: 'sm' | 'md' | 'lg'
  className?: string
}

const TAMANOS = { sm: 'h-4 w-4', md: 'h-5 w-5', lg: 'h-7 w-7' }

/** Estrellas de solo lectura, para notas y promedios. */
export function Estrellas({ valor, tamano = 'md', className = '' }: Props) {
  return (
    <span
      role="img"
      aria-label={`${valor.toLocaleString('es-CL', { maximumFractionDigits: 1 })} de 5 estrellas`}
      className={`inline-flex gap-0.5 ${className}`}
    >
      {[0, 1, 2, 3, 4].map((i) => {
        const relleno = Math.max(0, Math.min(1, valor - i))
        return (
          <span key={i} className={`relative ${TAMANOS[tamano]}`}>
            <svg viewBox="0 0 20 20" className="absolute inset-0 h-full w-full text-tinta-200 dark:text-tinta-600">
              <path d={ESTRELLA} fill="currentColor" />
            </svg>
            <span className="absolute inset-0 overflow-hidden" style={{ width: `${relleno * 100}%` }}>
              <svg viewBox="0 0 20 20" className={`h-full text-sol-400 ${TAMANOS[tamano]}`}>
                <path d={ESTRELLA} fill="currentColor" />
              </svg>
            </span>
          </span>
        )
      })}
    </span>
  )
}

export const NOMBRES_NOTA = ['', 'Muy mala', 'Mala', 'Regular', 'Buena', 'Excelente'] as const

/**
 * Elegir una nota entera de 1 a 5. Es un grupo de radios: se usa con
 * mouse (con vista previa al pasar) o con flechas del teclado.
 */
export function EstrellasInput({ valor, alCambiar }: { valor: number; alCambiar: (nota: number) => void }) {
  const [encima, setEncima] = useState(0)
  const mostrada = encima || valor

  return (
    <div className="flex flex-col items-center gap-2">
      <div role="radiogroup" aria-label="Nota" className="flex gap-1" onMouseLeave={() => setEncima(0)}>
        {[1, 2, 3, 4, 5].map((n) => (
          <label
            key={n}
            onMouseEnter={() => setEncima(n)}
            className="cursor-pointer rounded-lg p-0.5 transition hover:scale-110 has-focus-visible:ring-4 has-focus-visible:ring-marca-300/60"
          >
            <input
              type="radio"
              name="nota"
              value={n}
              checked={valor === n}
              onChange={() => alCambiar(n)}
              className="sr-only"
              aria-label={`${n} de 5: ${NOMBRES_NOTA[n]}`}
            />
            <svg
              viewBox="0 0 20 20"
              aria-hidden
              className={`h-10 w-10 transition-colors ${n <= mostrada ? 'text-sol-400' : 'text-tinta-200 dark:text-tinta-600'}`}
            >
              <path d={ESTRELLA} fill="currentColor" />
            </svg>
          </label>
        ))}
      </div>
      <p className="h-5 text-sm font-semibold text-texto">{mostrada ? NOMBRES_NOTA[mostrada] : 'Elige una nota'}</p>
    </div>
  )
}
