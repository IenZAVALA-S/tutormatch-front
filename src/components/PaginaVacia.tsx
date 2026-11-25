/** Marcador para las pantallas que todavía no se construyen. */
export function PaginaVacia({ titulo, descripcion }: { titulo: string; descripcion?: string }) {
  return (
    <section>
      <h1 className="text-2xl font-semibold">{titulo}</h1>
      {descripcion && <p className="mt-2 text-texto-suave">{descripcion}</p>}
      <p className="mt-6 rounded-md border border-dashed border-borde bg-superficie/60 p-6 text-sm text-texto-suave">
        Pantalla pendiente (ver docs/flujo.md).
      </p>
    </section>
  )
}
