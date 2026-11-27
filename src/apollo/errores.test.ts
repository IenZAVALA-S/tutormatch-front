import { describe, expect, it } from 'vitest'
import { CombinedGraphQLErrors } from '@apollo/client/errors'
import { codigoError, mensajeError } from './errores'

const errorGraphQL = (code: string, message = 'Mensaje del BFF') =>
  new CombinedGraphQLErrors({ errors: [{ message, extensions: { code } }] })

describe('errores del BFF', () => {
  it('lee el código de extensions.code', () => {
    expect(codigoError(errorGraphQL('CONFLICT'))).toBe('CONFLICT')
    expect(codigoError(new Error('red'))).toBeNull()
  })

  it('usa el mensaje propio de la pantalla si lo hay', () => {
    expect(mensajeError(errorGraphQL('UNAUTHENTICATED'), { UNAUTHENTICATED: 'Email o contraseña incorrectos' })).toBe(
      'Email o contraseña incorrectos',
    )
  })

  it('tiene mensajes por defecto, incluidos los del agente', () => {
    expect(mensajeError(errorGraphQL('SERVICE_UNAVAILABLE'))).toMatch(/no responde/)
    expect(mensajeError(errorGraphQL('TOO_MANY_REQUESTS'))).toMatch(/muy seguido/)
    expect(mensajeError(errorGraphQL('GATEWAY_TIMEOUT'))).toMatch(/demoró/)
  })

  it('en CONFLICT y BAD_REQUEST usa el texto del BFF, que explica la regla', () => {
    expect(mensajeError(errorGraphQL('CONFLICT', 'Cruce de horario'))).toBe('Cruce de horario')
  })

  it('sin código (error de red) pide revisar la conexión', () => {
    expect(mensajeError(new TypeError('Failed to fetch'))).toMatch(/conexión/)
  })
})
