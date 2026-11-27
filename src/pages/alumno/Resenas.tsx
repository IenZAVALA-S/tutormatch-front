import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@apollo/client/react'
import { mensajeError } from '../../apollo/errores'
import { RAMOS } from '../../auth/operaciones'
import { useSesion } from '../../auth/useSesion'
import { Avatar } from '../../components/Avatar'
import { Cargando } from '../../components/Carga'
import { Estrellas } from '../../components/Estrellas'
import { Boton } from '../../components/Modal'
import { Toasts, useToasts } from '../../components/Toasts'
import { describirInicio, formatoChile } from '../../utils/bloques'
import { RESENAS_ALUMNO } from './operaciones'
import { ModalEvaluar, type SesionPorEvaluar } from './resenas/ModalEvaluar'

/** Sesiones finalizadas: por evaluar y ya evaluadas. */
export function ResenasAlumno() {
  const yo = useSesion()!.usuario.id
  const { toasts, mostrar, cerrar } = useToasts()
  const { data, loading, error } = useQuery(RESENAS_ALUMNO, {
    variables: { estudianteId: yo },
    fetchPolicy: 'cache-and-network',
  })
  const { data: datosRamos } = useQuery(RAMOS)
  const nombres = useMemo(() => new Map((datosRamos?.ramos ?? []).map((r) => [r.codigo, r.nombre])), [datosRamos])
  const [evaluando, setEvaluando] = useState<SesionPorEvaluar | null>(null)

  const { porEvaluar, evaluadas } = useMemo(() => {
    const propias = new Map((data?.misEvaluaciones ?? []).map((e) => [e.sesionId, e]))
    // De la más reciente a la más antigua.
    const sesiones = [...(data?.sesiones ?? [])].sort((a, b) => b.inicio.localeCompare(a.inicio))
    return {
      porEvaluar: sesiones.filter((s) => !propias.has(s.id)),
      evaluadas: sesiones.flatMap((s) => {
        const evaluacion = propias.get(s.id)
        return evaluacion ? [{ sesion: s, evaluacion }] : []
      }),
    }
  }, [data])

  if (loading && !data) return <Cargando className="text-texto-suave" />
  if (error && !data) return <p className="text-marca-700 dark:text-marca-300">{mensajeError(error)}</p>

  const nombreTutor = (s: { tutor?: { nombre: string } | null; tutorId: string }) =>
    s.tutor?.nombre ?? `Tutor ${s.tutorId.slice(0, 8)}`
  const nombreRamo = (codigo: string) => nombres.get(codigo) ?? codigo

  return (
    <div className="space-y-6 pb-10">
      <h1 className="text-3xl font-bold tracking-tight">Reseñas</h1>

      {/* Por evaluar */}
      <section className="tarjeta-marca space-y-4 p-4 sm:p-6">
        <header className="flex items-center gap-2">
          <h2 className="text-xl font-bold">Por evaluar</h2>
          {porEvaluar.length > 0 && (
            <span className="rounded-full bg-marca-500 px-2 py-0.5 text-xs font-bold text-white">{porEvaluar.length}</span>
          )}
        </header>
        {porEvaluar.length === 0 ? (
          <div className="rounded-xl border-2 border-dashed border-borde px-6 py-10 text-center text-texto-suave">
            <p className="font-semibold text-texto">
              {data?.sesiones.length ? '¡Evaluaste todas tus tutorías!' : 'Todavía no tienes tutorías terminadas.'}
            </p>
            <p className="mt-1 text-sm">Cuando una tutoría termine, aparecerá aquí para que la evalúes.</p>
            {!data?.sesiones.length && (
              <Link to="/alumno" className="mt-3 inline-block font-semibold text-marca-700 hover:underline dark:text-marca-300">
                Buscar una tutoría
              </Link>
            )}
          </div>
        ) : (
          <ul className="space-y-2">
            {porEvaluar.map((s) => (
              <li
                key={s.id}
                className="flex animate-entrar flex-wrap items-center gap-3 rounded-xl border border-borde bg-superficie p-4 shadow-sm"
              >
                <Avatar nombre={nombreTutor(s)} tamano="sm" />
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold">
                    {nombreRamo(s.ramoCodigo)} con {nombreTutor(s)}
                  </p>
                  <p className="text-sm text-texto-suave">{describirInicio(s.inicio)}</p>
                </div>
                <Boton
                  tono="peligro"
                  onClick={() =>
                    setEvaluando({
                      id: s.id,
                      tutor: nombreTutor(s),
                      ramo: nombreRamo(s.ramoCodigo),
                      horario: describirInicio(s.inicio),
                    })
                  }
                >
                  ★ Evaluar
                </Boton>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Ya evaluadas */}
      {evaluadas.length > 0 && (
        <section className="space-y-3 rounded-2xl border border-borde bg-superficie/90 p-4 shadow-sm backdrop-blur sm:p-6">
          <header>
            <h2 className="text-xl font-bold">Tus reseñas</h2>
            <p className="text-sm text-texto-suave">Son anónimas para el tutor y no se pueden editar.</p>
          </header>
          <ul className="space-y-2">
            {evaluadas.map(({ sesion: s, evaluacion: e }) => (
              <li key={s.id} className="rounded-xl border border-borde bg-fondo/50 p-4">
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                  <p className="font-semibold">
                    {nombreRamo(s.ramoCodigo)} con {nombreTutor(s)}
                  </p>
                  <span className="text-sm text-texto-suave">{describirInicio(s.inicio)}</span>
                  <span className="ml-auto rounded-full bg-acento-100 px-2 py-0.5 text-xs font-bold text-acento-700 dark:bg-acento-900/50 dark:text-acento-200">
                    Evaluada
                  </span>
                </div>
                <div className="mt-2 flex items-center gap-2">
                  <Estrellas valor={e.nota} tamano="sm" />
                  <span className="text-xs text-texto-suave">
                    el {formatoChile(e.creadaEn, "d 'de' MMMM 'de' yyyy")}
                  </span>
                </div>
                {e.comentario ? (
                  <p className="mt-2 whitespace-pre-line">{e.comentario}</p>
                ) : (
                  <p className="mt-2 text-sm text-texto-suave italic">Sin comentario.</p>
                )}
              </li>
            ))}
          </ul>
        </section>
      )}

      <ModalEvaluar
        sesion={evaluando}
        alCerrar={() => setEvaluando(null)}
        alEvaluar={() => mostrar('¡Gracias! Tu reseña quedó publicada.')}
      />
      <Toasts toasts={toasts} alCerrar={cerrar} />
    </div>
  )
}
