import { Navigate, createBrowserRouter } from 'react-router-dom'
import { RutaProtegida, RutaTutor } from './auth/RutaProtegida'
import { useSesion } from './auth/useSesion'
import { PortalLayout } from './layout/PortalLayout'
import { Login } from './pages/Login'
import { Registro } from './pages/Registro'
import { InscripcionTutor } from './pages/InscripcionTutor'
import { NoEncontrada } from './pages/NoEncontrada'
import { CalendarioTutor } from './pages/tutor/Calendario'
import { ArchivosTutor } from './pages/tutor/Archivos'
import { ResenasTutor } from './pages/tutor/Resenas'
import { PerfilTutor } from './pages/tutor/Perfil'
import { Reservas } from './pages/alumno/Reservas'
import { MisTutorias } from './pages/alumno/MisTutorias'
import { ArchivosAlumno } from './pages/alumno/Archivos'
import { Avisos } from './pages/alumno/Avisos'
import { ResenasAlumno } from './pages/alumno/Resenas'
import { Agente } from './pages/alumno/Agente'
import { PerfilAlumno } from './pages/alumno/Perfil'

/** `/`: al login sin sesión; con sesión, al último portal elegido. */
function Inicio() {
  const sesion = useSesion()
  if (!sesion) return <Navigate to="/login" replace />
  const portal = sesion.portal === 'tutor' && sesion.usuario.esTutor ? 'tutor' : 'alumno'
  return <Navigate to={`/${portal}`} replace />
}

// Ninguna ruta puede empezar con /graphql ni /archivos: esas van al BFF.
export const router = createBrowserRouter([
  { path: '/', element: <Inicio /> },
  { path: '/login', element: <Login /> },
  { path: '/registro', element: <Registro /> },
  {
    element: <RutaProtegida />,
    children: [
      { path: '/inscripcion-tutor', element: <InscripcionTutor /> },
      {
        element: <RutaTutor />,
        children: [
          {
            path: '/tutor',
            element: <PortalLayout portal="tutor" />,
            children: [
              { index: true, element: <CalendarioTutor /> },
              { path: 'archivos', element: <ArchivosTutor /> },
              { path: 'resenas', element: <ResenasTutor /> },
              { path: 'perfil', element: <PerfilTutor /> },
            ],
          },
        ],
      },
      {
        path: '/alumno',
        element: <PortalLayout portal="alumno" />,
        children: [
          { index: true, element: <Reservas /> },
          { path: 'tutorias', element: <MisTutorias /> },
          { path: 'archivos', element: <ArchivosAlumno /> },
          { path: 'avisos', element: <Avisos /> },
          { path: 'resenas', element: <ResenasAlumno /> },
          { path: 'agente', element: <Agente /> },
          { path: 'perfil', element: <PerfilAlumno /> },
        ],
      },
    ],
  },
  { path: '*', element: <NoEncontrada /> },
])
