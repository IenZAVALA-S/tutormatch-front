import { useEffect, type ReactNode } from 'react'

interface Props {
  abierto: boolean
  titulo: string
  alCerrar: () => void
  children: ReactNode
  /** Botones del pie, alineados a la derecha. */
  acciones?: ReactNode
}

/** Modal reutilizable. Se cierra con Escape o haciendo clic fuera. */
export function Modal({ abierto, titulo, alCerrar, children, acciones }: Props) {
  useEffect(() => {
    if (!abierto) return
    const alTeclear = (e: KeyboardEvent) => e.key === 'Escape' && alCerrar()
    window.addEventListener('keydown', alTeclear)
    return () => window.removeEventListener('keydown', alTeclear)
  }, [abierto, alCerrar])

  if (!abierto) return null

  return (
    <div
      className="fixed inset-0 z-40 grid place-items-center bg-tinta-900/50 p-4 backdrop-blur-sm"
      onMouseDown={(e) => e.target === e.currentTarget && alCerrar()}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={titulo}
        className="w-full max-w-sm animate-entrar rounded-2xl border border-borde bg-superficie p-6 text-texto shadow-2xl"
      >
        <h2 className="text-lg font-bold">{titulo}</h2>
        <div className="mt-3 text-sm text-texto-suave">{children}</div>
        {acciones && <div className="mt-6 flex flex-wrap justify-end gap-2">{acciones}</div>}
      </div>
    </div>
  )
}

type Tono = 'acento' | 'peligro' | 'neutro'

const TONOS: Record<Tono, string> = {
  acento: 'bg-acento-500 text-white hover:bg-acento-600 shadow-sm',
  peligro: 'bg-marca-600 text-white hover:bg-marca-700 shadow-sm',
  neutro: 'border border-borde text-texto hover:bg-marca-50 dark:hover:bg-tinta-700',
}

/** Botón chico para modales, tarjetas y notificaciones. */
export function Boton({
  tono = 'neutro',
  className = '',
  ...resto
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { tono?: Tono }) {
  return (
    <button
      type="button"
      className={`rounded-lg px-3.5 py-2 text-sm font-semibold transition hover:-translate-y-px active:translate-y-0 disabled:pointer-events-none disabled:opacity-50 ${TONOS[tono]} ${className}`}
      {...resto}
    />
  )
}
