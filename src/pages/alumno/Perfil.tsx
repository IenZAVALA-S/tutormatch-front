import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery } from '@apollo/client/react'
import { mensajeError } from '../../apollo/errores'
import { actualizarSesion } from '../../auth/sesion'
import { useSesion } from '../../auth/useSesion'
import { Avatar } from '../../components/Avatar'
import { BotonNegro } from '../../components/formulario'
import { Cargando } from '../../components/Carga'
import { PERFIL_ALUMNO } from './operaciones'

/** Perfil del alumno: sus datos y, si no es tutor, el acceso para inscribirse. */
export function PerfilAlumno() {
  const navegar = useNavigate()
  const sesion = useSesion()
  const { data, loading, error } = useQuery(PERFIL_ALUMNO, { fetchPolicy: 'cache-and-network' })
  const yo = data?.yo

  // Si `esTutor` cambió (por ejemplo, desde otra pestaña), se actualiza la sesión.
  useEffect(() => {
    if (yo && sesion && yo.esTutor !== sesion.usuario.esTutor) actualizarSesion({ usuario: yo })
  }, [yo, sesion])

  if (loading && !yo) return <Cargando className="text-texto-suave" />
  if (error && !yo) return <p className="text-marca-700 dark:text-marca-300">{mensajeError(error)}</p>
  if (!yo) return null

  function irComoTutor(ruta: string) {
    actualizarSesion({ portal: 'tutor' })
    navegar(ruta)
  }

  return (
    <div className="space-y-6 pb-10">
      <h1 className="text-3xl font-bold tracking-tight">Perfil</h1>

      <section className="flex flex-wrap items-center gap-5 rounded-2xl border border-borde bg-superficie/90 p-5 shadow-sm backdrop-blur sm:p-6">
        <Avatar nombre={yo.nombre} tamano="lg" />
        <div className="min-w-0 flex-1">
          <p className="truncate text-2xl font-bold">{yo.nombre}</p>
          <p className="truncate text-texto-suave">{yo.email}</p>
        </div>
        <span
          className={`rounded-full px-3 py-1 text-sm font-bold ${
            yo.esTutor
              ? 'bg-acento-100 text-acento-700 dark:bg-acento-900/50 dark:text-acento-200'
              : 'bg-marca-50 text-marca-700 dark:bg-tinta-700 dark:text-marca-200'
          }`}
        >
          {yo.esTutor ? 'Alumno y tutor' : 'Alumno'}
        </span>
      </section>

      {yo.esTutor ? (
        <section className="tarjeta-marca flex flex-wrap items-center gap-4 p-5 sm:p-6">
          <div className="min-w-0 flex-1">
            <h2 className="text-xl font-bold">También eres tutor</h2>
            <p className="mt-1 text-sm text-texto-suave">
              Tus ramos, tu calendario y tus reseñas como tutor están en el portal de tutor.
            </p>
          </div>
          <button
            type="button"
            onClick={() => irComoTutor('/tutor/perfil')}
            className="rounded-full bg-marca-500 px-5 py-2.5 font-semibold text-white shadow-boton transition hover:-translate-y-0.5 hover:bg-marca-600 hover:shadow-boton-hover"
          >
            Ir a mis ramos
          </button>
        </section>
      ) : (
        // Invitación a ser tutor: mismo bloque naranjo del registro.
        <section className="bloque-marca rounded-2xl p-6 text-white sm:p-8">
          <h2 className="text-2xl font-bold">¿Aprobaste algún ramo? Hazte tutor</h2>
          <p className="mt-2 max-w-xl text-marca-50">
            Ayuda a otros estudiantes en los ramos que aprobaste. Solo necesitas indicar la nota (4.0 a 7.0) y el
            periodo en que los aprobaste. Sigues siendo alumno, y puedes cambiar de portal cuando quieras.
          </p>
          <BotonNegro type="button" onClick={() => irComoTutor('/inscripcion-tutor')} className="mt-5">
            Inscribirme como tutor
          </BotonNegro>
        </section>
      )}
    </div>
  )
}
