import { ApolloClient, ApolloLink, HttpLink, InMemoryCache } from '@apollo/client'
import { SetContextLink } from '@apollo/client/link/context'
import { ErrorLink } from '@apollo/client/link/error'
import { CombinedGraphQLErrors, ServerError } from '@apollo/client/errors'
import { limpiarSesion, obtenerToken, suscribirSesion } from '../auth/sesion'

// Ruta relativa: proxy de Vite en desarrollo, ingress en Kubernetes.
const http = new HttpLink({ uri: '/graphql' })

/** Agrega `Authorization: Bearer <token>` si hay sesión. */
const autorizacion = new SetContextLink((contexto) => {
  const token = obtenerToken()
  if (!token) return {}
  return { headers: { ...contexto.headers, Authorization: `Bearer ${token}` } }
})

/**
 * Token vencido o inválido → `UNAUTHENTICATED`: se limpia la sesión y
 * `RutaProtegida` manda al login. (En el login mismo, email o contraseña
 * incorrectos también dan `UNAUTHENTICATED`; ahí no hay sesión que limpiar
 * y la pantalla muestra el error.)
 */
const errores = new ErrorLink(({ error }) => {
  const sinAutenticar =
    (CombinedGraphQLErrors.is(error) &&
      error.errors.some((e) => e.extensions?.code === 'UNAUTHENTICATED')) ||
    (ServerError.is(error) && error.statusCode === 401)
  if (sinAutenticar) limpiarSesion()
})

export const clienteApollo = new ApolloClient({
  link: ApolloLink.from([errores, autorizacion, http]),
  cache: new InMemoryCache(),
})

// Al cerrar sesión no deben quedar datos del usuario anterior en caché.
let teniaSesion = obtenerToken() !== null
suscribirSesion(() => {
  const tieneSesion = obtenerToken() !== null
  if (teniaSesion && !tieneSesion) void clienteApollo.clearStore()
  teniaSesion = tieneSesion
})
