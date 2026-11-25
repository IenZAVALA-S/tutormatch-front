import { Link } from 'react-router-dom'
import { LayoutPublico } from '../layout/LayoutPublico'
import { PaginaVacia } from '../components/PaginaVacia'

export function Registro() {
  return (
    <LayoutPublico>
      <PaginaVacia
        titulo="Registrarse"
        descripcion="Nombre, email y contraseña. El registro de tutor agrega el formulario de ramos."
      />
      <p className="mt-6 text-sm text-slate-600">
        ¿Ya tienes cuenta?{' '}
        <Link to="/login" className="text-indigo-700 hover:underline">
          Inicia sesión
        </Link>
      </p>
    </LayoutPublico>
  )
}
