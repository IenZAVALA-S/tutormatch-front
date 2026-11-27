import { describe, expect, it } from 'vitest'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Route, Routes } from 'react-router-dom'
import { obtenerSesion } from '../auth/sesion'
import { ALUMNO, conSesion, renderizar, TUTORA } from '../test/utilidades'
import { PortalLayout } from './PortalLayout'

const conRutas = (portal: 'alumno' | 'tutor') => (
  <Routes>
    <Route path={`/${portal}`} element={<PortalLayout portal={portal} />}>
      <Route index element={<p>Inicio del portal</p>} />
    </Route>
    <Route path="*" element={<p>Otra página</p>} />
  </Routes>
)

describe('Topbar y layout de portal', () => {
  it('muestra la navegación del portal de alumno', () => {
    conSesion(ALUMNO)
    renderizar(conRutas('alumno'), { ruta: '/alumno' })
    for (const enlace of ['Reservas', 'Mis tutorías', 'Archivos', 'Avisos', 'Reseñas', 'Agente', 'Perfil']) {
      expect(screen.getByRole('link', { name: enlace })).toBeInTheDocument()
    }
    expect(screen.getByText('Inicio del portal')).toBeInTheDocument()
    // Quien no es tutor no ve el enlace al portal de tutor.
    expect(screen.queryByRole('button', { name: 'Ir al portal de tutor' })).not.toBeInTheDocument()
  })

  it('un tutor puede cambiar de portal sin volver a entrar', async () => {
    conSesion(TUTORA, 'alumno')
    renderizar(conRutas('alumno'), { ruta: '/alumno' })
    await userEvent.click(screen.getByRole('button', { name: 'Ir al portal de tutor' }))
    expect(screen.getByText('Otra página')).toBeInTheDocument()
    expect(obtenerSesion()?.portal).toBe('tutor')
  })

  it('cerrar sesión limpia la sesión', async () => {
    conSesion(TUTORA, 'tutor')
    renderizar(conRutas('tutor'), { ruta: '/tutor' })
    expect(screen.getByRole('link', { name: 'Calendario' })).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: 'Cerrar sesión' }))
    expect(obtenerSesion()).toBeNull()
  })
})
