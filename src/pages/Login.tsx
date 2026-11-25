import { useState, type FormEvent } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { useMutation } from '@apollo/client/react'
import { mensajeError } from '../apollo/errores'
import { LOGIN } from '../auth/operaciones'
import { guardarSesion, type Portal } from '../auth/sesion'
import { useSesion } from '../auth/useSesion'
import { AvisoError, BotonNegro, Campo } from '../components/formulario'
import { LayoutPublico } from '../layout/LayoutPublico'

export function Login() {
  const sesion = useSesion()
  const navegar = useNavigate()
  const [login, { loading }] = useMutation(LOGIN)
  const [error, setError] = useState<string | null>(null)

  // Ya tiene sesión: directo a su portal.
  if (sesion) return <Navigate to="/" replace />

  async function ingresar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault()
    // El login es uno solo; el botón con que se envió solo elige el portal.
    const boton = (evento.nativeEvent as SubmitEvent).submitter as HTMLButtonElement | null
    const portal: Portal = boton?.value === 'tutor' ? 'tutor' : 'alumno'
    const datos = new FormData(evento.currentTarget)
    setError(null)
    try {
      const { data } = await login({
        variables: {
          input: {
            email: String(datos.get('email')).trim(),
            password: String(datos.get('password')),
          },
        },
      })
      if (!data) return
      guardarSesion({ token: data.login.token, usuario: data.login.usuario, portal })
      // Si entra como tutor sin serlo, RutaTutor lo manda al formulario de ramos.
      navegar(`/${portal}`, { replace: true })
    } catch (e) {
      setError(mensajeError(e, { UNAUTHENTICATED: 'El email o la contraseña no son correctos.' }))
    }
  }

  return (
    <LayoutPublico
      saludo="Bienvenid@ a"
      pie={
        <>
          ¿No tienes cuenta?{' '}
          <Link to="/registro" className="font-semibold text-marca-700 underline-offset-2 hover:underline">
            Regístrate
          </Link>
        </>
      }
    >
      <h1 className="text-2xl font-bold">Iniciar sesión</h1>
      <form onSubmit={ingresar} className="mt-6 space-y-4">
        <Campo etiqueta="Email" name="email" type="email" autoComplete="email" required />
        <Campo etiqueta="Contraseña" name="password" type="password" autoComplete="current-password" required />
        <AvisoError>{error}</AvisoError>
        <div className="grid gap-3 pt-2 sm:grid-cols-2">
          <BotonNegro type="submit" name="portal" value="tutor" disabled={loading}>
            Ingreso como tutor
          </BotonNegro>
          <BotonNegro type="submit" name="portal" value="alumno" disabled={loading}>
            Ingreso como alumno
          </BotonNegro>
        </div>
      </form>
    </LayoutPublico>
  )
}
