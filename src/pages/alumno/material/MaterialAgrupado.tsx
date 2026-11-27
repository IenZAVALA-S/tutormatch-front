import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@apollo/client/react'
import { mensajeError } from '../../../apollo/errores'
import { RAMOS } from '../../../auth/operaciones'
import { Cargando } from '../../../components/Carga'
import { Toasts, useToasts } from '../../../components/Toasts'
import type { MaterialListaFragment, TipoMaterial } from '../../../gql/graphql'
import { ItemMaterial } from '../../tutor/archivos/ItemMaterial'
import { MATERIAL_VISIBLE } from '../operaciones'

interface Props {
  tipo: TipoMaterial
  titulo: string
  /** Texto cuando no hay nada de este tipo. */
  vacio: string
}

interface GrupoRamo {
  codigo: string
  nombre: string
  tutores: { tutorId: string; items: MaterialListaFragment[] }[]
  total: number
}

/**
 * Material visible para el alumno, de un tipo (ARCHIVO o AVISO), agrupado
 * por asignatura y, dentro de cada una, por tutor. Lo que se ve lo decide
 * el back; el front no filtra.
 */
export function MaterialAgrupado({ tipo, titulo, vacio }: Props) {
  const { toasts, mostrar, cerrar } = useToasts()
  const { data, loading, error } = useQuery(MATERIAL_VISIBLE, { fetchPolicy: 'cache-and-network' })
  const { data: datosRamos } = useQuery(RAMOS)

  const grupos = useMemo<GrupoRamo[]>(() => {
    const nombres = new Map((datosRamos?.ramos ?? []).map((r) => [r.codigo, r.nombre]))
    const porRamo = new Map<string, Map<string, MaterialListaFragment[]>>()
    for (const m of data?.material ?? []) {
      if (m.tipo !== tipo) continue
      const tutores = porRamo.get(m.ramoCodigo) ?? new Map<string, MaterialListaFragment[]>()
      tutores.set(m.tutorId, [...(tutores.get(m.tutorId) ?? []), m])
      porRamo.set(m.ramoCodigo, tutores)
    }
    return [...porRamo.entries()]
      .map(([codigo, tutores]) => ({
        codigo,
        nombre: nombres.get(codigo) ?? codigo,
        tutores: [...tutores.entries()].map(([tutorId, items]) => ({ tutorId, items })),
        total: [...tutores.values()].reduce((n, items) => n + items.length, 0),
      }))
      .sort((a, b) => a.nombre.localeCompare(b.nombre))
  }, [data, datosRamos, tipo])

  if (loading && !data) return <Cargando className="text-texto-suave" />
  if (error && !data) return <p className="text-marca-700 dark:text-marca-300">{mensajeError(error)}</p>

  return (
    <div className="space-y-6 pb-10">
      <header className="flex flex-wrap items-end gap-3">
        <h1 className="mr-auto text-3xl font-bold tracking-tight">{titulo}</h1>
        {/* Saltos rápidos a cada asignatura */}
        {grupos.length > 1 && (
          <nav aria-label="Ir a una asignatura" className="flex flex-wrap gap-2">
            {grupos.map((g) => (
              <a
                key={g.codigo}
                href={`#ramo-${g.codigo}`}
                className="rounded-full bg-marca-50 px-3 py-1 text-sm font-semibold text-marca-700 transition hover:bg-marca-100 dark:bg-tinta-700 dark:text-marca-200 dark:hover:bg-tinta-600"
              >
                {g.nombre} ({g.total})
              </a>
            ))}
          </nav>
        )}
      </header>

      {grupos.length === 0 ? (
        <section className="tarjeta-marca px-6 py-12 text-center">
          <p className="text-lg font-semibold">{vacio}</p>
          <p className="mx-auto mt-2 max-w-md text-sm text-texto-suave">
            Aquí aparece lo que publican los tutores con los que tienes o tuviste una tutoría, en esa asignatura.
          </p>
          <Link
            to="/alumno"
            className="mt-4 inline-block font-semibold text-marca-700 hover:underline dark:text-marca-300"
          >
            Buscar una tutoría en Reservas
          </Link>
        </section>
      ) : (
        grupos.map((g) => (
          <section key={g.codigo} id={`ramo-${g.codigo}`} className="tarjeta-marca scroll-mt-24 space-y-5 p-4 sm:p-6">
            <header className="flex flex-wrap items-baseline gap-x-3">
              <h2 className="text-xl font-bold">{g.nombre}</h2>
              <span className="text-sm text-texto-suave">
                {g.codigo} · {g.total} {etiqueta(tipo, g.total)}
              </span>
            </header>
            {g.tutores.map(({ tutorId, items }) => (
              <div key={tutorId}>
                {/*
                  Material no trae el nombre del tutor (pendiente en el back):
                  se muestra su id como recordatorio visible.
                */}
                <h3
                  className="mb-2 flex items-center gap-2 text-xs font-bold tracking-wide text-texto-suave uppercase"
                  title={`Id del tutor: ${tutorId}`}
                >
                  <span className="grid h-6 w-6 place-items-center rounded-full bg-marca-100 text-[0.65rem] text-marca-700 dark:bg-tinta-700 dark:text-marca-200">
                    ?
                  </span>
                  Tutor · id {tutorId.slice(0, 8)}
                </h3>
                <ul className="space-y-3">
                  {items.map((m) => (
                    <ItemMaterial key={m.id} material={m} marcarNuevo alError={(t) => mostrar(t, 'error')} />
                  ))}
                </ul>
              </div>
            ))}
          </section>
        ))
      )}

      <Toasts toasts={toasts} alCerrar={cerrar} />
    </div>
  )
}

function etiqueta(tipo: TipoMaterial, n: number) {
  if (tipo === 'AVISO') return n === 1 ? 'aviso' : 'avisos'
  return n === 1 ? 'archivo' : 'archivos'
}
