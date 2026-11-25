/** Marcador para las pantallas que todavía no se construyen. */
export function PaginaVacia({ titulo, descripcion }: { titulo: string; descripcion?: string }) {
  return (
    <section>
      <h1 className="text-2xl font-semibold">{titulo}</h1>
      {descripcion && <p className="mt-2 text-slate-600">{descripcion}</p>}
      <p className="mt-6 rounded-md border border-dashed border-slate-300 p-6 text-sm text-slate-500">
        Pantalla pendiente (ver docs/flujo.md).
      </p>
    </section>
  )
}
