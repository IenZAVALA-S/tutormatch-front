import { describe, expect, it } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Route, Routes } from 'react-router-dom'
import { AGREGAR_RAMOS_TUTOR, LOGIN, RAMOS, REGISTRO } from '../auth/operaciones'
import { RutaProtegida, RutaTutor } from '../auth/RutaProtegida'
import { obtenerSesion } from '../auth/sesion'
import { ALUMNO, conSesion, mock, mockError, renderizar, TUTORA } from '../test/utilidades'
import { InscripcionTutor } from './InscripcionTutor'
import { Login } from './Login'
import { NoEncontrada } from './NoEncontrada'
import { Registro } from './Registro'

const acceso = (usuario = ALUMNO) => ({ __typename: 'Acceso', token: 'token-nuevo', usuario })

const CATALOGO = mock(RAMOS, {
  ramos: [
    { __typename: 'Ramo', codigo: 'MAT1610', nombre: 'Cálculo II' },
    { __typename: 'Ramo', codigo: 'IIC2233', nombre: 'Programación Avanzada' },
  ],
})

async function llenar(etiqueta: string, valor: string) {
  await userEvent.type(screen.getByLabelText(etiqueta), valor)
}

/** Campo del primer ramo (los de los ramos plegados también están en la página). */
async function llenarRamo(etiqueta: string, valor: string) {
  const campo = screen.getAllByLabelText(etiqueta)[0]
  await userEvent.clear(campo)
  await userEvent.type(campo, valor)
}

describe('Login', () => {
  it('entra como alumno, guarda la sesión y va al portal de alumno', async () => {
    renderizar(<Login />, {
      ruta: '/login',
      patron: '/login',
      mocks: [mock(LOGIN, { login: acceso() }, { input: { email: 'benja@test.local', password: 'clave' } })],
    })
    expect(screen.getByText('Bienvenid@ a')).toBeInTheDocument()
    await llenar('Email', 'benja@test.local')
    await llenar('Contraseña', 'clave')
    await userEvent.click(screen.getByRole('button', { name: 'Ingreso como alumno' }))
    expect(await screen.findByTestId('ruta')).toHaveTextContent('/alumno')
    expect(obtenerSesion()).toMatchObject({ token: 'token-nuevo', portal: 'alumno' })
  })

  it('el botón de tutor elige el portal de tutor', async () => {
    renderizar(<Login />, { ruta: '/login', patron: '/login', mocks: [mock(LOGIN, { login: acceso(TUTORA) })] })
    await llenar('Email', 'tutora@test.local')
    await llenar('Contraseña', 'clave')
    await userEvent.click(screen.getByRole('button', { name: 'Ingreso como tutor' }))
    expect(await screen.findByTestId('ruta')).toHaveTextContent('/tutor')
  })

  it('email o contraseña incorrectos (UNAUTHENTICATED) muestra un mensaje claro', async () => {
    renderizar(<Login />, { ruta: '/login', patron: '/login', mocks: [mockError(LOGIN, 'UNAUTHENTICATED')] })
    await llenar('Email', 'x@test.local')
    await llenar('Contraseña', 'mala')
    await userEvent.click(screen.getByRole('button', { name: 'Ingreso como alumno' }))
    expect(await screen.findByRole('alert')).toHaveTextContent('El email o la contraseña no son correctos.')
    expect(obtenerSesion()).toBeNull()
  })

  it('con sesión iniciada no muestra el login', () => {
    conSesion()
    renderizar(<Login />, { ruta: '/login', patron: '/login' })
    expect(screen.getByTestId('ruta')).toHaveTextContent('/alumno')
  })
})

describe('Registro', () => {
  it('el registro de tutor sigue al formulario de ramos', async () => {
    renderizar(<Registro />, { ruta: '/registro', patron: '/registro', mocks: [mock(REGISTRO, { registro: acceso() })] })
    await llenar('Nombre', 'Benja')
    await llenar('Email', 'benja@test.local')
    await llenar('Contraseña', 'clave')
    await userEvent.click(screen.getByRole('button', { name: 'Registrarme como tutor' }))
    expect(await screen.findByTestId('ruta')).toHaveTextContent('/inscripcion-tutor')
  })

  it('email repetido (CONFLICT)', async () => {
    renderizar(<Registro />, { ruta: '/registro', patron: '/registro', mocks: [mockError(REGISTRO, 'CONFLICT')] })
    await llenar('Nombre', 'Benja')
    await llenar('Email', 'benja@test.local')
    await llenar('Contraseña', 'clave')
    await userEvent.click(screen.getByRole('button', { name: 'Registrarme como alumno' }))
    expect(await screen.findByRole('alert')).toHaveTextContent('Ya existe una cuenta con ese email.')
  })
})

describe('Inscripción como tutor (formulario de ramos)', () => {
  it('explica cada error bajo su campo y, corregido, inscribe y va al portal de tutor', async () => {
    conSesion(ALUMNO, 'tutor')
    renderizar(<InscripcionTutor />, {
      ruta: '/inscripcion-tutor',
      patron: '/inscripcion-tutor',
      mocks: [CATALOGO, mock(AGREGAR_RAMOS_TUTOR, { agregarRamosTutor: { ...ALUMNO, esTutor: true } })],
    })
    await userEvent.click(await screen.findByRole('button', { name: 'Inscribirme como tutor' }))
    expect(screen.getByRole('alert')).toHaveTextContent('Elige al menos un ramo.')

    await userEvent.click(screen.getByRole('checkbox', { name: /Cálculo II/ }))
    await llenarRamo('Nota de aprobación', '3.9')
    await llenarRamo('Periodo (año-semestre)', '2025-3')
    await userEvent.click(screen.getByRole('button', { name: 'Inscribirme como tutor' }))
    expect(screen.getByText('Con nota bajo 4.0 el ramo no queda aprobado.')).toBeInTheDocument()
    expect(screen.getByText('El semestre solo puede ser 1 o 2 (pusiste 3).')).toBeInTheDocument()
    expect(screen.getByText('Revisa los datos de Cálculo II.')).toBeInTheDocument()

    // Se revalida mientras se corrige.
    await llenarRamo('Nota de aprobación', '6,2')
    expect(screen.queryByText(/bajo 4.0/)).not.toBeInTheDocument()
    await llenarRamo('Periodo (año-semestre)', '2025-2')

    await userEvent.click(screen.getByRole('button', { name: 'Inscribirme como tutor' }))
    expect(await screen.findByTestId('ruta')).toHaveTextContent('/tutor')
    expect(obtenerSesion()?.usuario.esTutor).toBe(true)
  })
})

describe('rutas protegidas', () => {
  it('sin sesión manda al login', () => {
    renderizar(
      <Routes>
        <Route element={<RutaProtegida />}>
          <Route path="/alumno" element={<p>Portal</p>} />
        </Route>
        <Route path="/login" element={<p>Login</p>} />
      </Routes>,
      { ruta: '/alumno' },
    )
    expect(screen.getByText('Login')).toBeInTheDocument()
  })

  it('quien no es tutor va al formulario de ramos, o al portal de alumno si lo eligió', async () => {
    conSesion(ALUMNO, 'tutor')
    const rutas = (
      <Routes>
        <Route element={<RutaTutor />}>
          <Route path="/tutor" element={<p>Portal tutor</p>} />
        </Route>
        <Route path="/inscripcion-tutor" element={<p>Formulario</p>} />
        <Route path="/alumno" element={<p>Portal alumno</p>} />
      </Routes>
    )
    const { unmount } = renderizar(rutas, { ruta: '/tutor' })
    expect(screen.getByText('Formulario')).toBeInTheDocument()
    unmount()
    conSesion(ALUMNO, 'alumno')
    renderizar(rutas, { ruta: '/tutor' })
    await waitFor(() => expect(screen.getByText('Portal alumno')).toBeInTheDocument())
  })

  it('página no encontrada', () => {
    renderizar(<NoEncontrada />)
    expect(screen.getByText('Página no encontrada')).toBeInTheDocument()
  })
})
