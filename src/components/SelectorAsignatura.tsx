export interface OpcionAsignatura {
  codigo: string
  nombre: string
}

interface Props {
  opciones: OpcionAsignatura[]
  valor: string | null
  alCambiar: (codigo: string) => void
  etiqueta?: string
  /** Texto de la opción vacía; si no se da, no hay opción vacía. */
  vacio?: string
  /** Oculta la etiqueta a la vista (sigue para lectores de pantalla). */
  sinEtiqueta?: boolean
  className?: string
}

/**
 * Selector de asignatura: un solo componente para el calendario del tutor,
 * sus archivos y las reservas del alumno.
 */
export function SelectorAsignatura({
  opciones,
  valor,
  alCambiar,
  etiqueta = 'Asignatura',
  vacio,
  sinEtiqueta = false,
  className = '',
}: Props) {
  return (
    <label className={`block ${className}`}>
      <span className={sinEtiqueta ? 'sr-only' : 'mb-1.5 block text-sm font-medium text-texto-suave'}>{etiqueta}</span>
      <span className="relative block">
        <select
          value={valor ?? ''}
          onChange={(e) => alCambiar(e.target.value)}
          className="w-full cursor-pointer appearance-none rounded-xl border border-borde bg-superficie py-3 pr-10 pl-4 font-semibold text-texto shadow-sm transition outline-none hover:border-marca-300 focus:border-marca-400 focus:ring-4 focus:ring-marca-200/50 dark:focus:ring-marca-800/50"
        >
          {vacio !== undefined && (
            <option value="" disabled>
              {vacio}
            </option>
          )}
          {opciones.map((o) => (
            <option key={o.codigo} value={o.codigo}>
              {o.nombre} · {o.codigo}
            </option>
          ))}
        </select>
        <svg
          viewBox="0 0 20 20"
          aria-hidden
          className="pointer-events-none absolute top-1/2 right-3 h-5 w-5 -translate-y-1/2 text-marca-500"
          fill="currentColor"
        >
          <path d="M5.3 7.3a1 1 0 0 1 1.4 0L10 10.6l3.3-3.3a1 1 0 1 1 1.4 1.4l-4 4a1 1 0 0 1-1.4 0l-4-4a1 1 0 0 1 0-1.4Z" />
        </svg>
      </span>
    </label>
  )
}
