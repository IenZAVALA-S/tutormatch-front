import { useState, type ReactNode } from 'react'
import { useQuery } from '@apollo/client/react'
import { mensajeError } from '../../../apollo/errores'
import { Avatar } from '../../../components/Avatar'
import { Estrellas } from '../../../components/Estrellas'
import { Boton } from '../../../components/Modal'
import type { TutorTarjetaFragment } from '../../../gql/graphql'
import { BLOQUES, bloqueDeInicio, DURACION_BLOQUE_MIN, formatoChile, horaChile } from '../../../utils/bloques'
import { EVALUACIONES_TUTOR } from '../../tutor/operaciones'

const formatoNota = new Intl.NumberFormat('es-CL', { minimumFractionDigits: 1, maximumFractionDigits: 1 })

interface Props {
  inicio: string
  tutorId: string
  tutor: TutorTarjetaFragment | null | undefined
  nombreRamo: string
  /** Etiqueta de estado (para las reservas propias). */
  estado?: 'PENDIENTE' | 'CONFIRMADA'
  /** Botones de la tarjeta (Inscribirme o Cancelar). */
  acciones: ReactNode
}

/** Una tarjeta del popup del día: tutor, horario y asignatura. */
export function TarjetaHorario({ inicio, tutorId, tutor, nombreRamo, estado, acciones }: Props) {
  const [verTutor, setVerTutor] = useState(false)
  const info = bloqueDeInicio(inicio)
  const fin = horaChile(new Date(new Date(inicio).getTime() + DURACION_BLOQUE_MIN * 60_000))
  const nombre = tutor?.nombre ?? `Tutor ${tutorId.slice(0, 8)}`

  return (
    <li
      className={`animate-entrar rounded-xl border p-4 shadow-sm transition ${
        estado === 'CONFIRMADA'
          ? 'border-acento-200 bg-acento-50/70 dark:border-acento-800 dark:bg-acento-900/30'
          : estado === 'PENDIENTE'
            ? 'border-sol-200 bg-sol-100/60 dark:border-sol-800 dark:bg-sol-800/20'
            : 'border-borde bg-superficie hover:border-marca-200 dark:hover:border-marca-800'
      }`}
    >
      <div className="flex items-start gap-3">
        <Avatar nombre={nombre} tamano="sm" />
        <div className="min-w-0 flex-1">
          <p className="truncate font-semibold text-texto">{nombre}</p>
          <p className="flex items-center gap-1.5 text-xs">
            {tutor && tutor.cantidadEvaluaciones > 0 ? (
              <>
                <Estrellas valor={tutor.promedioEvaluaciones} tamano="sm" />
                <span>
                  {formatoNota.format(tutor.promedioEvaluaciones)} · {tutor.cantidadEvaluaciones}{' '}
                  {tutor.cantidadEvaluaciones === 1 ? 'reseña' : 'reseñas'}
                </span>
              </>
            ) : (
              <span>Sin reseñas todavía</span>
            )}
          </p>
        </div>
        <div className="text-right">
          <p className="text-lg leading-none font-black text-marca-600 dark:text-marca-300">
            {info ? `${info.bloque} · ` : ''}
            {horaChile(inicio)}
          </p>
          <p className="mt-1 text-xs">hasta las {fin}</p>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <span className="rounded-full bg-marca-50 px-2 py-0.5 text-xs font-semibold text-marca-700 dark:bg-tinta-700 dark:text-marca-200">
          {nombreRamo}
        </span>
        {estado && (
          <span
            className={`rounded-full px-2 py-0.5 text-xs font-bold ${
              estado === 'CONFIRMADA'
                ? 'bg-acento-500 text-white'
                : 'bg-sol-300 text-sol-800'
            }`}
          >
            {estado === 'CONFIRMADA' ? 'Confirmada' : 'Pendiente: el tutor aún no la acepta'}
          </span>
        )}
        <div className="ml-auto flex flex-wrap gap-2">
          <Boton onClick={() => setVerTutor((v) => !v)} aria-expanded={verTutor}>
            {verTutor ? 'Ocultar' : 'Sobre el tutor'}
          </Boton>
          {acciones}
        </div>
      </div>

      {verTutor && <SobreTutor tutorId={tutorId} />}
    </li>
  )
}

/** Reseñas del tutor (`evaluacionesTutor`), dentro de la tarjeta. */
function SobreTutor({ tutorId }: { tutorId: string }) {
  const { data, loading, error } = useQuery(EVALUACIONES_TUTOR, { variables: { tutorId } })

  return (
    <div className="mt-3 animate-entrar rounded-lg border border-borde bg-fondo/60 p-3">
      {loading ? (
        <p>Cargando reseñas…</p>
      ) : error || !data ? (
        <p className="text-marca-700 dark:text-marca-300">{mensajeError(error)}</p>
      ) : data.evaluacionesTutor.cantidad === 0 ? (
        <p>Este tutor todavía no tiene reseñas.</p>
      ) : (
        <>
          <p className="flex items-center gap-2 font-semibold text-texto">
            <Estrellas valor={data.evaluacionesTutor.promedio} tamano="sm" />
            {formatoNota.format(data.evaluacionesTutor.promedio)} de 5 · {data.evaluacionesTutor.cantidad}{' '}
            {data.evaluacionesTutor.cantidad === 1 ? 'reseña' : 'reseñas'}
          </p>
          <ul className="mt-2 space-y-2">
            {data.evaluacionesTutor.evaluaciones
              .filter((e) => e.comentario)
              .slice(0, 3)
              .map((e, i) => (
                <li key={i} className="border-l-2 border-marca-300 pl-3 dark:border-marca-700">
                  <p className="text-texto">“{e.comentario}”</p>
                  <p className="mt-0.5 text-xs">
                    {e.nota} ★ · {formatoChile(e.creadaEn, "d 'de' MMMM")}
                  </p>
                </li>
              ))}
          </ul>
          {data.evaluacionesTutor.evaluaciones.every((e) => !e.comentario) && (
            <p className="mt-1">Sus reseñas no tienen comentarios.</p>
          )}
        </>
      )}
    </div>
  )
}

/** "B · 09:55" para usar en mensajes. */
export function horarioCorto(inicio: string) {
  const info = bloqueDeInicio(inicio)
  return info ? `${info.bloque} ${BLOQUES[info.bloque]}` : horaChile(inicio)
}
