/** "Tutora Prueba" → "TP" */
export function iniciales(nombre: string) {
  return (
    nombre
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((p) => p[0]!.toUpperCase())
      .join('') || '?'
  )
}

const TAMANOS = { sm: 'h-10 w-10 text-sm', md: 'h-12 w-12 text-base', lg: 'h-20 w-20 text-2xl' }

/** Círculo naranjo con las iniciales (no hay fotos de perfil). */
export function Avatar({ nombre, tamano = 'md' }: { nombre: string; tamano?: keyof typeof TAMANOS }) {
  return (
    <span
      aria-hidden
      className={`bloque-marca grid shrink-0 place-items-center rounded-full font-black text-white ${TAMANOS[tamano]}`}
    >
      {iniciales(nombre)}
    </span>
  )
}
