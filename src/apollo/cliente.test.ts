import { describe, expect, it, vi } from 'vitest'
import { gql } from '@apollo/client'
import { obtenerSesion } from '../auth/sesion'
import { conSesion } from '../test/utilidades'
import { clienteApollo } from './cliente'

const CONSULTA = gql`
  query Prueba {
    ramos {
      codigo
    }
  }
`

const json = (cuerpo: unknown) =>
  new Response(JSON.stringify(cuerpo), { status: 200, headers: { 'content-type': 'application/json' } })

describe('cliente Apollo', () => {
  it('manda el token en Authorization a /graphql (ruta relativa)', async () => {
    conSesion()
    const fetch = vi.fn().mockResolvedValue(json({ data: { ramos: [] } }))
    vi.stubGlobal('fetch', fetch)
    await clienteApollo.query({ query: CONSULTA, fetchPolicy: 'network-only' })
    const [url, opciones] = fetch.mock.calls[0]
    expect(url).toBe('/graphql')
    expect(new Headers(opciones.headers).get('authorization')).toBe(`Bearer ${obtenerSesion()!.token}`)
  })

  it('ante UNAUTHENTICATED limpia la sesión (y RutaProtegida manda al login)', async () => {
    conSesion()
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(json({ data: null, errors: [{ message: 'Token vencido', extensions: { code: 'UNAUTHENTICATED' } }] })),
    )
    await expect(clienteApollo.query({ query: CONSULTA, fetchPolicy: 'network-only' })).rejects.toThrow()
    expect(obtenerSesion()).toBeNull()
  })

  it('otros errores no cierran la sesión', async () => {
    conSesion()
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(json({ data: null, errors: [{ message: 'No', extensions: { code: 'FORBIDDEN' } }] })),
    )
    await expect(clienteApollo.query({ query: CONSULTA, fetchPolicy: 'network-only' })).rejects.toThrow()
    expect(obtenerSesion()).not.toBeNull()
  })
})
