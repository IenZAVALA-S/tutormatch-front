// Ayudas para los tests de componentes y pantallas.
import type { ReactElement } from 'react'
import { render } from '@testing-library/react'
import type { MockLink } from '@apollo/client/testing'
import { MockedProvider } from '@apollo/client/testing/react'
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom'
import { guardarSesion, type Portal, type UsuarioSesion } from '../auth/sesion'

/** JWT de prueba (sin firma válida) que vence en una hora. */
export function tokenDePrueba(segundos = 3600): string {
  const b64 = (o: object) => btoa(JSON.stringify(o)).replace(/=+$/, '')
  return `${b64({ alg: 'none' })}.${b64({ sub: 'u1', exp: Math.floor(Date.now() / 1000) + segundos })}.firma`
}

// Con __typename: el tipo generado no lo trae, pero Apollo lo agrega a las
// respuestas, y los mocks lo necesitan para guardar en caché.
export const ALUMNO = {
  __typename: 'Usuario',
  id: 'alumno-1',
  nombre: 'Benja Alumno',
  email: 'benja@test.local',
  esTutor: false,
} as UsuarioSesion

export const TUTORA = {
  __typename: 'Usuario',
  id: 'tutora-1',
  nombre: 'Tutora Prueba',
  email: 'tutora@test.local',
  esTutor: true,
} as UsuarioSesion

type MockedResponse = MockLink.MockedResponse

/** Inicia sesión de prueba (sin pasar por el BFF). */
export function conSesion(usuario: UsuarioSesion = ALUMNO, portal: Portal = 'alumno') {
  guardarSesion({ token: tokenDePrueba(), usuario, portal })
}

/**
 * Respuesta de prueba para una operación. Sin `variables`, calza con
 * cualquiera; se puede usar varias veces (sondeos y recargas).
 */
export function mock(query: MockedResponse['request']['query'], data: object, variables?: object): MockedResponse {
  return {
    request: { query, variables: variables ?? (() => true) },
    result: { data },
    maxUsageCount: Number.POSITIVE_INFINITY,
  }
}

/** Respuesta de prueba con un error del BFF (extensions.code). */
export function mockError(query: MockedResponse['request']['query'], code: string, message = 'Error del BFF'): MockedResponse {
  return {
    request: { query, variables: () => true },
    result: { errors: [{ message, extensions: { code } }] as never },
    maxUsageCount: Number.POSITIVE_INFINITY,
  }
}

interface Opciones {
  mocks?: MockedResponse[]
  /** Ruta inicial, por ejemplo "/alumno?ramo=MAT1610". */
  ruta?: string
  /** Patrón de la ruta donde se monta `ui` (por defecto, cualquiera). */
  patron?: string
}

/**
 * Renderiza con Apollo de prueba y router en memoria. Las demás rutas
 * muestran su ruta en un `data-testid="ruta"`, para comprobar navegaciones.
 */
export function renderizar(ui: ReactElement, { mocks = [], ruta = '/', patron = '*' }: Opciones = {}) {
  return render(
    <MockedProvider mocks={mocks}>
      <MemoryRouter initialEntries={[ruta]}>
        <Routes>
          <Route path={patron} element={ui} />
          {patron !== '*' && <Route path="*" element={<RutaActual />} />}
        </Routes>
      </MemoryRouter>
    </MockedProvider>,
  )
}

function RutaActual() {
  const { pathname } = useLocation()
  return <p data-testid="ruta">{pathname}</p>
}
