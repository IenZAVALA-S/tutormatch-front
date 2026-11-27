import { CombinedGraphQLErrors } from '@apollo/client/errors'

/** Códigos de `extensions.code` que manda el BFF. */
export type CodigoError =
  | 'BAD_REQUEST'
  | 'UNAUTHENTICATED'
  | 'FORBIDDEN'
  | 'NOT_FOUND'
  | 'CONFLICT'
  | 'SERVICE_UNAVAILABLE'
  /** Agente: demasiados mensajes seguidos. */
  | 'TOO_MANY_REQUESTS'
  /** Agente: no terminó a tiempo. */
  | 'GATEWAY_TIMEOUT'

/** Código del primer error GraphQL, o null si fue un error de red u otro. */
export function codigoError(error: unknown): CodigoError | null {
  if (!CombinedGraphQLErrors.is(error)) return null
  const codigo = error.errors[0]?.extensions?.code
  return typeof codigo === 'string' ? (codigo as CodigoError) : null
}

const POR_DEFECTO: Partial<Record<CodigoError, string>> = {
  UNAUTHENTICATED: 'Tu sesión venció. Vuelve a iniciar sesión.',
  FORBIDDEN: 'No tienes permiso para hacer esto.',
  NOT_FOUND: 'No se encontró lo que buscabas.',
  SERVICE_UNAVAILABLE: 'El servicio no responde. Intenta de nuevo en un rato.',
  TOO_MANY_REQUESTS: 'Estás enviando mensajes muy seguido. Espera un momento y vuelve a intentarlo.',
  GATEWAY_TIMEOUT: 'El agente se demoró demasiado y no alcanzó a terminar. Intenta de nuevo.',
}

/**
 * Mensaje para mostrar al usuario. Se elige por el código, nunca por el
 * texto. `propios` reemplaza el mensaje de un código en una pantalla dada;
 * si no hay uno propio ni por defecto (BAD_REQUEST, CONFLICT), se usa el
 * del BFF, que viene en español y explica qué regla falló.
 */
export function mensajeError(
  error: unknown,
  propios: Partial<Record<CodigoError, string>> = {},
): string {
  const codigo = codigoError(error)
  if (codigo) {
    const mensaje = propios[codigo] ?? POR_DEFECTO[codigo]
    if (mensaje) return mensaje
    if (CombinedGraphQLErrors.is(error) && error.errors[0]?.message) return error.errors[0].message
  }
  return 'No se pudo conectar con el servidor. Revisa tu conexión e intenta de nuevo.'
}
