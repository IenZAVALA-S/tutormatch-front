import { useState, type FormEvent } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { useMutation } from '@apollo/client/react'
import { mensajeError } from '../apollo/errores'
import { REGISTRO } from '../auth/operaciones'
import { guardarSesion, type Portal } from '../auth/sesion'
import { useSesion } from '../auth/useSesion'
import { AvisoError, BotonNegro, Campo } from '../components/formulario'
import { LayoutPublico } from '../layout/LayoutPublico'

export function Registro() {
  const sesion = useSesion()
  const navegar = useNavigate()
  const [registro, { loading }] = useMutation(REGISTRO)
  const [error, setError] = useState<string | null>(null)

  if (sesion) return <Navigate to="/" replace />

  async function registrarse(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault()
    const boton = (evento.nativeEvent as SubmitEvent).submitter as HTMLButtonElement | null
    const portal: Portal = boton?.value === 'tutor' ? 'tutor' : 'alumno'
    const datos = new FormData(evento.currentTarget)
    setError(null)
    try {
      const { data } = await registro({
        variables: {
          input: {
            nombre: String(datos.get('nombre')).trim(),
            email: String(datos.get('email')).trim(),
            password: String(datos.get('password')),
          },
        },
      })
      if (!data) return
      guardarSesion({ token: data.registro.token, usuario: data.registro.usuario, portal })
      // El registro de tutor sigue con el formulario de ramos.
      navegar(portal === 'tutor' ? '/inscripcion-tutor' : '/alumno', { replace: true })
    } catch (e) {
      setError(mensajeError(e, { CONFLICT: 'Ya existe una cuenta con ese email.' }))
    }
  }

  return (
    <LayoutPublico
      pie={
        <>
          ¿Ya tienes cuenta?{' '}
          <Link to="/login" className="font-semibold text-marca-700 underline-offset-2 hover:underline">
            Inicia sesión
          </Link>
        </>
      }
    >
      <h1 className="text-2xl font-bold">Crear cuenta</h1>
      <form onSubmit={registrarse} className="mt-6 space-y-4">
        <Campo variante="blanco" etiqueta="Nombre" name="nombre" autoComplete="name" required />
        <Campo variante="blanco" etiqueta="Email" name="email" type="email" autoComplete="email" required />
        <Campo
          variante="blanco"
          etiqueta="Contraseña"
          name="password"
          type="password"
          autoComplete="new-password"
          required
        />
        <AvisoError>{error}</AvisoError>
        <div className="grid gap-3 pt-2 sm:grid-cols-2">
          <BotonNegro type="submit" value="alumno" disabled={loading}>
            Registrarme como alumno
          </BotonNegro>
          <BotonNegro type="submit" value="tutor" disabled={loading}>
            Registrarme como tutor
          </BotonNegro>
        </div>
        <p className="text-sm text-marca-100">
          Como tutor, después indicas los ramos que aprobaste. Puedes hacerlo también más adelante desde tu perfil.
        </p>
      </form>
    </LayoutPublico>
  )
}
