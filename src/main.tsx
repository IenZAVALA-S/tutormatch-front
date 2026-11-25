import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { ApolloProvider } from '@apollo/client/react'
import { RouterProvider } from 'react-router-dom'
import { clienteApollo } from './apollo/cliente'
import { FondoDorfic } from './components/FondoDorfic'
import { router } from './router'
import './index.css'
import './tema'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ApolloProvider client={clienteApollo}>
      <FondoDorfic />
      <RouterProvider router={router} />
    </ApolloProvider>
  </StrictMode>,
)
