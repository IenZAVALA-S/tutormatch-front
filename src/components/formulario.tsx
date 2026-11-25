import type { ButtonHTMLAttributes, InputHTMLAttributes, ReactNode } from 'react'

// Piezas de formulario para los bloques de color sólido (login, registro).

/**
 * - `bloque`: campo teñido sobre el bloque naranjo (login).
 * - `blanco`: campo blanco que contrasta con el bloque (registro).
 */
export type VarianteCampo = 'bloque' | 'blanco'

const ESTILO_CAMPO: Record<VarianteCampo, string> = {
  bloque:
    'bg-marca-600 text-white placeholder:text-marca-200 border-marca-400 focus:border-white focus:ring-white/40 dark:bg-marca-800 dark:border-marca-600',
  blanco:
    'bg-white text-tinta-800 placeholder:text-tinta-400 border-white focus:border-tinta-800 focus:ring-tinta-800/20 dark:bg-tinta-800 dark:text-marca-50 dark:border-tinta-700 dark:focus:border-marca-200 dark:focus:ring-marca-200/20',
}

interface PropsCampo extends InputHTMLAttributes<HTMLInputElement> {
  etiqueta: string
  variante?: VarianteCampo
}

export function Campo({ etiqueta, variante = 'bloque', className = '', id, ...resto }: PropsCampo) {
  const idCampo = id ?? resto.name
  return (
    <label htmlFor={idCampo} className="block">
      <span className="mb-1 block text-sm font-medium text-white">{etiqueta}</span>
      <input
        id={idCampo}
        className={`w-full rounded-lg border px-3 py-2.5 outline-none focus:ring-4 ${ESTILO_CAMPO[variante]} ${className}`}
        {...resto}
      />
    </label>
  )
}

/**
 * Botón negro (tinta) con letras blancas. Al pasar el mouse pasa a un
 * durazno claro con letras rojizas y se levanta un poco; al hacer clic baja.
 */
export function BotonNegro({ className = '', ...resto }: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className={`rounded-lg bg-tinta-800 px-4 py-3 font-semibold text-white shadow-boton transition duration-200 ease-out hover:-translate-y-0.5 hover:bg-marca-100 hover:text-marca-800 dark:bg-tinta-900 dark:hover:bg-marca-200 dark:hover:text-tinta-900 hover:shadow-boton-hover focus:outline-none focus-visible:ring-4 focus-visible:ring-white/60 active:translate-y-0 active:shadow-boton disabled:pointer-events-none disabled:opacity-60 ${className}`}
      {...resto}
    />
  )
}

/** Mensaje de error dentro del bloque. */
export function AvisoError({ children }: { children: ReactNode }) {
  if (!children) return null
  return (
    <p role="alert" className="rounded-lg bg-white px-3 py-2 text-sm font-medium text-marca-800">
      {children}
    </p>
  )
}
