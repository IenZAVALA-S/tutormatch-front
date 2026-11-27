import { useMemo, useState } from 'react'
import { useQuery } from '@apollo/client/react'
import { mensajeError } from '../../apollo/errores'
import { useSesion } from '../../auth/useSesion'
import { Cargando } from '../../components/Carga'
import { Estrellas } from '../../components/Estrellas'
import { formatoChile } from '../../utils/bloques'
import { EVALUACIONES_TUTOR, MIS_RAMOS } from './operaciones'

const formatoNota = new Intl.NumberFormat('es-CL', { minimumFractionDigits: 1, maximumFractionDigits: 1 })

/** Reseñas del propio tutor: promedio, cantidad y comentarios anónimos. */
export function ResenasTutor() {
  const tutorId = useSesion()!.usuario.id
  const { data, loading, error } = useQuery(EVALUACIONES_TUTOR, { variables: { tutorId } })
  const { data: datosRamos } = useQuery(MIS_RAMOS)
  const nombres = useMemo(
    () => new Map((datosRamos?.yo.ramos ?? []).map((r) => [r.ramo.codigo, r.ramo.nombre])),
    [datosRamos],
  )
  const [filtro, setFiltro] = useState<string | null>(null)

  const resenas = useMemo(() => data?.evaluacionesTutor.evaluaciones ?? [], [data])
  const porRamo = useMemo(() => {
    const cuenta = new Map<string, number>()
    for (const r of resenas) cuenta.set(r.ramoCodigo, (cuenta.get(r.ramoCodigo) ?? 0) + 1)
    return [...cuenta.entries()]
  }, [resenas])
  const distribucion = useMemo(
    () => [5, 4, 3, 2, 1].map((nota) => ({ nota, cantidad: resenas.filter((r) => r.nota === nota).length })),
    [resenas],
  )
  const visibles = filtro ? resenas.filter((r) => r.ramoCodigo === filtro) : resenas

  if (loading) return <Cargando className="text-texto-suave" />
  if (error || !data) return <p className="text-marca-700 dark:text-marca-300">{mensajeError(error)}</p>

  const { promedio, cantidad } = data.evaluacionesTutor
  const maximo = Math.max(1, ...distribucion.map((d) => d.cantidad))

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Reseñas</h1>

      {/* Resumen: promedio y distribución */}
      <section className="grid gap-6 rounded-2xl border border-borde bg-superficie/90 p-5 shadow-sm backdrop-blur sm:grid-cols-[auto_1fr] sm:items-center sm:gap-10 sm:p-6">
        <div className="text-center sm:px-4">
          <p className="text-6xl font-black tracking-tight text-marca-600 dark:text-marca-300">
            {cantidad > 0 ? formatoNota.format(promedio) : '–'}
          </p>
          <Estrellas valor={promedio} tamano="lg" className="mt-2" />
          <p className="mt-2 text-sm text-texto-suave">
            {cantidad === 0 ? 'Aún sin reseñas' : `${cantidad} ${cantidad === 1 ? 'reseña' : 'reseñas'}`}
          </p>
        </div>
        <ul className="space-y-2" aria-label="Cantidad de reseñas por nota">
          {distribucion.map(({ nota, cantidad: n }) => (
            <li key={nota} className="grid grid-cols-[2.5rem_1fr_2rem] items-center gap-3 text-sm">
              <span className="flex items-center gap-1 font-semibold">
                {nota}
                <span className="text-sol-400">★</span>
              </span>
              <span className="h-2.5 overflow-hidden rounded-full bg-marca-50 dark:bg-tinta-700">
                <span
                  className="block h-full rounded-full bg-linear-to-r from-marca-400 to-marca-500 transition-[width] duration-500"
                  style={{ width: `${(n / maximo) * 100}%` }}
                />
              </span>
              <span className="text-right text-texto-suave">{n}</span>
            </li>
          ))}
        </ul>
      </section>

      {/* Comentarios */}
      <section className="tarjeta-marca space-y-4 p-4 sm:p-6">
        <header className="flex flex-wrap items-center gap-2">
          <h2 className="mr-auto text-xl font-bold">Comentarios</h2>
          {porRamo.length > 1 && (
            <>
              <Filtro activo={filtro === null} onClick={() => setFiltro(null)}>
                Todas ({resenas.length})
              </Filtro>
              {porRamo.map(([codigo, n]) => (
                <Filtro key={codigo} activo={filtro === codigo} onClick={() => setFiltro(codigo)}>
                  {nombres.get(codigo) ?? codigo} ({n})
                </Filtro>
              ))}
            </>
          )}
        </header>

        {visibles.length === 0 ? (
          <div className="rounded-xl border-2 border-dashed border-borde px-6 py-12 text-center text-texto-suave">
            <p className="font-semibold text-texto">Todavía no tienes reseñas.</p>
            <p className="mt-1 text-sm">Los alumnos pueden evaluarte cuando una sesión contigo termina.</p>
          </div>
        ) : (
          <ul className="space-y-3">
            {visibles.map((r, i) => (
              <li
                key={`${r.creadaEn}-${i}`}
                className="animate-entrar rounded-xl border border-borde bg-superficie p-4 shadow-sm"
              >
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                  <Estrellas valor={r.nota} tamano="sm" />
                  <span className="rounded-full bg-marca-50 px-2 py-0.5 text-xs font-semibold text-marca-700 dark:bg-tinta-700 dark:text-marca-200">
                    {nombres.get(r.ramoCodigo) ?? r.ramoCodigo}
                  </span>
                  <span className="ml-auto text-xs text-texto-suave">
                    {formatoChile(r.creadaEn, "d 'de' MMMM 'de' yyyy")}
                  </span>
                </div>
                {r.comentario ? (
                  <p className="mt-2 leading-relaxed whitespace-pre-line">{r.comentario}</p>
                ) : (
                  <p className="mt-2 text-sm text-texto-suave italic">Sin comentario.</p>
                )}
              </li>
            ))}
          </ul>
        )}
        <p className="text-xs text-texto-suave">Las reseñas son anónimas: no muestran quién las escribió ni de qué sesión son.</p>
      </section>
    </div>
  )
}

function Filtro({ activo, ...resto }: React.ButtonHTMLAttributes<HTMLButtonElement> & { activo: boolean }) {
  return (
    <button
      type="button"
      aria-pressed={activo}
      className={`rounded-full px-3 py-1 text-sm font-semibold transition ${
        activo
          ? 'bg-marca-500 text-white shadow-sm'
          : 'bg-marca-50 text-marca-700 hover:bg-marca-100 dark:bg-tinta-700 dark:text-marca-200 dark:hover:bg-tinta-600'
      }`}
      {...resto}
    />
  )
}
