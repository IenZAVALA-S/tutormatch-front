import type { ReactNode } from 'react'
import logo from '../assets/PLACEHOLDER.png'
import { BotonTema } from '../components/BotonTema'

interface Props {
  children: ReactNode
  /** Texto sobre el logo, por ejemplo "Bienvenid@ a". */
  saludo?: string
  pie?: ReactNode
}

/**
 * Login, registro e inscripción como tutor: el logo arriba de la página y,
 * debajo, el contenido en un bloque de color con gradiente suave.
 */
export function LayoutPublico({ children, saludo, pie }: Props) {
  return (
    <div className="relative flex min-h-screen flex-col items-center px-4 pt-10 pb-24">
      <BotonTema className="absolute top-4 right-4" />
      {saludo && (
        <p className="text-2xl font-semibold tracking-tight text-marca-800 sm:text-3xl dark:text-marca-200">
          {saludo}
        </p>
      )}
      {/*
        El PNG tiene fondo blanco y trazo negro. En claro, multiply vuelve
        transparente el blanco; en oscuro se invierte y screen quita el negro.
      */}
      <img
        src={logo}
        alt="TutorMatch"
        className={`h-28 w-auto mix-blend-multiply sm:h-36 dark:invert dark:mix-blend-screen ${saludo ? '-mt-3' : ''}`}
      />
      <div className="bloque-marca mt-6 w-full max-w-md animate-entrar rounded-2xl p-6 text-white sm:p-8">
        {children}
      </div>
      {pie && (
        <div className="mt-6 rounded-full bg-superficie/75 px-4 py-2 text-sm text-texto-suave shadow-sm backdrop-blur">
          {pie}
        </div>
      )}
    </div>
  )
}
