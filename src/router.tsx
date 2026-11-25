import type { ComponentType } from 'react'
import { Navigate, Outlet, createBrowserRouter } from 'react-router-dom'
import { RutaProtegida, RutaTutor } from './auth/RutaProtegida'
import { useSesion } from './auth/useSesion'
import { BarraCarga, CargaInicial } from './components/Carga'
import { PortalLayout } from './layout/PortalLayout'

/** `/`: al login sin sesión; con sesión, al último portal elegido. */
function Inicio() {
  const sesion = useSesion()
  if (!sesion) return <Navigate to="/login" replace />
  // RutaTutor manda al formulario de ramos si eligió tutor sin serlo.
  return <Navigate to={`/${sesion.portal}`} replace />
}

/** Raíz: la barra de carga entre páginas y la página actual. */
function Raiz() {
  return (
    <>
      <BarraCarga />
      <Outlet />
    </>
  )
}

/**
 * Cada página se baja recién cuando se visita (code splitting); mientras
 * tanto se muestra la barra de carga. `m` es el módulo y `nombre` su export.
 */
function pagina<M extends Record<string, unknown>>(importar: () => Promise<M>, nombre: keyof M) {
  return async () => ({ Component: (await importar())[nombre] as ComponentType })
}

// Ninguna ruta puede empezar con /graphql ni /archivos: esas van al BFF.
export const router = createBrowserRouter([
  {
    element: <Raiz />,
    hydrateFallbackElement: <CargaInicial />,
    children: [
      { path: '/', element: <Inicio /> },
      { path: '/login', lazy: pagina(() => import('./pages/Login'), 'Login') },
      { path: '/registro', lazy: pagina(() => import('./pages/Registro'), 'Registro') },
      {
        element: <RutaProtegida />,
        children: [
          {
            path: '/inscripcion-tutor',
            lazy: pagina(() => import('./pages/InscripcionTutor'), 'InscripcionTutor'),
          },
          {
            element: <RutaTutor />,
            children: [
              {
                path: '/tutor',
                element: <PortalLayout portal="tutor" />,
                children: [
                  { index: true, lazy: pagina(() => import('./pages/tutor/Calendario'), 'CalendarioTutor') },
                  { path: 'archivos', lazy: pagina(() => import('./pages/tutor/Archivos'), 'ArchivosTutor') },
                  { path: 'resenas', lazy: pagina(() => import('./pages/tutor/Resenas'), 'ResenasTutor') },
                  { path: 'perfil', lazy: pagina(() => import('./pages/tutor/Perfil'), 'PerfilTutor') },
                ],
              },
            ],
          },
          {
            path: '/alumno',
            element: <PortalLayout portal="alumno" />,
            children: [
              { index: true, lazy: pagina(() => import('./pages/alumno/Reservas'), 'Reservas') },
              { path: 'tutorias', lazy: pagina(() => import('./pages/alumno/MisTutorias'), 'MisTutorias') },
              { path: 'archivos', lazy: pagina(() => import('./pages/alumno/Archivos'), 'ArchivosAlumno') },
              { path: 'avisos', lazy: pagina(() => import('./pages/alumno/Avisos'), 'Avisos') },
              { path: 'resenas', lazy: pagina(() => import('./pages/alumno/Resenas'), 'ResenasAlumno') },
              { path: 'agente', lazy: pagina(() => import('./pages/alumno/Agente'), 'Agente') },
              { path: 'perfil', lazy: pagina(() => import('./pages/alumno/Perfil'), 'PerfilAlumno') },
            ],
          },
        ],
      },
      { path: '*', lazy: pagina(() => import('./pages/NoEncontrada'), 'NoEncontrada') },
    ],
  },
])
