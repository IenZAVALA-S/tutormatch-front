import { Link } from 'react-router-dom'
import { LayoutPublico } from '../layout/LayoutPublico'

export function NoEncontrada() {
  return (
    <LayoutPublico>
      <h1 className="text-2xl font-semibold">Página no encontrada</h1>
      <Link to="/" className="mt-4 inline-block text-marca-700 hover:underline">
        Ir al inicio
      </Link>
    </LayoutPublico>
  )
}
