import { Link, useNavigate } from 'react-router-dom'
import { actualizarSesion } from '../auth/sesion'
import { FormularioRamos } from '../components/FormularioRamos'
import { LayoutPublico } from '../layout/LayoutPublico'

/** Formulario de ramos para quien entra o se registra como tutor sin serlo todavía. */
export function InscripcionTutor() {
  const navegar = useNavigate()

  return (
    <LayoutPublico
      pie={
        <Link
          to="/alumno"
          onClick={() => actualizarSesion({ portal: 'alumno' })}
          className="font-semibold text-marca-700 underline-offset-2 hover:underline"
        >
          Ahora no, ir al portal de alumno
        </Link>
      }
    >
      <h1 className="text-2xl font-bold">Inscribirme como tutor</h1>
      <p className="mt-2 text-sm text-marca-100">
        Elige los ramos que aprobaste e indica la nota (4.0 a 7.0) y el periodo en que los aprobaste.
      </p>
      <div className="mt-6">
        <FormularioRamos
          alTerminar={(usuario) => {
            actualizarSesion({ usuario, portal: 'tutor' })
            navegar('/tutor', { replace: true })
          }}
        />
      </div>
    </LayoutPublico>
  )
}
