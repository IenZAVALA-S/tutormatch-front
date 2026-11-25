import { Link } from 'react-router-dom'
import { LayoutPublico } from '../layout/LayoutPublico'
import { PaginaVacia } from '../components/PaginaVacia'

/** Formulario de ramos para quien entra como tutor sin serlo todavía. */
export function InscripcionTutor() {
  return (
    <LayoutPublico>
      <PaginaVacia
        titulo="Inscribirse como tutor"
        descripcion="Por cada ramo: nota de aprobación (4.0 a 7.0) y periodo (ej. 2025-2). Todo o nada."
      />
      <p className="mt-6 text-sm text-slate-600">
        <Link to="/alumno" className="text-indigo-700 hover:underline">
          Volver al portal de alumno
        </Link>
      </p>
    </LayoutPublico>
  )
}
