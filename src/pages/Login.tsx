import { Link } from 'react-router-dom'
import { LayoutPublico } from '../layout/LayoutPublico'
import { PaginaVacia } from '../components/PaginaVacia'

export function Login() {
  return (
    <LayoutPublico>
      <PaginaVacia
        titulo="Iniciar sesión"
        descripcion="Email y contraseña, con Ingreso como tutor e Ingreso como alumno."
      />
      <p className="mt-6 text-sm text-slate-600">
        ¿No tienes cuenta?{' '}
        <Link to="/registro" className="text-indigo-700 hover:underline">
          Regístrate
        </Link>
      </p>
    </LayoutPublico>
  )
}
