import { cambiarTema, useTema } from '../tema'

/** Alterna entre modo claro y oscuro. */
export function BotonTema({ className = '' }: { className?: string }) {
  const tema = useTema()
  const oscuro = tema === 'oscuro'
  return (
    <button
      type="button"
      onClick={() => cambiarTema(oscuro ? 'claro' : 'oscuro')}
      aria-label={oscuro ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
      title={oscuro ? 'Modo claro' : 'Modo oscuro'}
      className={`grid h-9 w-9 place-items-center rounded-full border border-borde bg-superficie/80 text-texto shadow-sm backdrop-blur transition hover:-translate-y-0.5 hover:bg-marca-100 hover:text-marca-800 dark:hover:bg-tinta-700 dark:hover:text-marca-200 ${className}`}
    >
      {oscuro ? (
        // Sol
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round">
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
        </svg>
      ) : (
        // Luna
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2} strokeLinejoin="round">
          <path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5Z" />
        </svg>
      )}
    </button>
  )
}
