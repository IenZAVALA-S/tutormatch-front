import { beforeEach, describe, expect, it, vi } from 'vitest'
import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { RAMOS } from '../../auth/operaciones'
import { obtenerSesion } from '../../auth/sesion'
import { ALUMNO, conSesion, mock, renderizar } from '../../test/utilidades'
import { CANCELAR_SESION, EVALUACIONES_TUTOR } from '../tutor/operaciones'
import { Agente } from './Agente'
import { ArchivosAlumno } from './Archivos'
import { Avisos } from './Avisos'
import { MisTutorias } from './MisTutorias'
import {
  CREAR_SESION,
  DISPONIBILIDAD_RAMO,
  EVALUAR,
  MATERIAL_VISIBLE,
  MIS_RESERVAS,
  MIS_TUTORIAS,
  PERFIL_ALUMNO,
  RESENAS_ALUMNO,
} from './operaciones'
import { PerfilAlumno } from './Perfil'
import { Reservas } from './Reservas'
import { ResenasAlumno } from './Resenas'

// Miércoles 25 de noviembre de 2026, 09:00 en Chile.
const AHORA = new Date('2026-11-25T12:00:00.000Z')

const CATALOGO = mock(RAMOS, {
  ramos: [
    { __typename: 'Ramo', codigo: 'MAT1610', nombre: 'Cálculo II' },
    { __typename: 'Ramo', codigo: 'IIC2233', nombre: 'Programación Avanzada' },
  ],
})
const tutor = (id: string, nombre: string, promedio = 0, cantidad = 0) => ({
  __typename: 'Usuario',
  id,
  nombre,
  promedioEvaluaciones: promedio,
  cantidadEvaluaciones: cantidad,
})
const TUTORA = tutor('tutora-1', 'Tutora Prueba', 4.25, 4)
const CAMILA = tutor('camila-1', 'Camila Rojas', 4.5, 2)

const sesion = (id: string, inicio: string, estado: string, t = CAMILA, ramoCodigo = 'MAT1610') => ({
  __typename: 'Sesion',
  id,
  inicio,
  estado,
  ramoCodigo,
  tutorId: t.id,
  tutor: t,
})

beforeEach(() => {
  vi.useFakeTimers({ toFake: ['Date'], now: AHORA })
  conSesion(ALUMNO, 'alumno')
})

describe('Reservas', () => {
  const casilla = (id: string, inicio: string, t: typeof TUTORA) => ({
    __typename: 'BloqueDisponibilidad',
    id,
    inicio,
    ramoCodigo: 'MAT1610',
    tutorId: t.id,
    tutor: t,
  })
  const mocks = () => [
    CATALOGO,
    mock(DISPONIBILIDAD_RAMO, {
      buscarDisponibilidad: [
        casilla('d1', '2026-11-26T11:10:00.000Z', TUTORA), // jueves A
        casilla('d2', '2026-11-26T14:40:00.000Z', CAMILA), // jueves C: choca con otra sesión suya
        casilla('d3', '2026-11-26T12:55:00.000Z', { ...TUTORA, id: ALUMNO.id, nombre: 'Yo mismo' }), // propia: no se muestra
      ],
    }),
    mock(MIS_RESERVAS, {
      sesiones: [
        sesion('r1', '2026-11-27T12:55:00.000Z', 'CONFIRMADA'),
        sesion('r2', '2026-11-26T14:40:00.000Z', 'PENDIENTE', TUTORA, 'IIC2233'),
      ],
    }),
    mock(CREAR_SESION, { crearSesion: { __typename: 'Sesion', id: 'r9', estado: 'PENDIENTE' } }),
    mock(CANCELAR_SESION, { cancelarSesion: { __typename: 'Sesion', id: 'r1', estado: 'CANCELADA' } }),
    mock(EVALUACIONES_TUTOR, {
      evaluacionesTutor: {
        __typename: 'EvaluacionesTutor',
        promedio: 4.25,
        cantidad: 1,
        evaluaciones: [
          { __typename: 'EvaluacionAnonima', nota: 5, comentario: 'Muy clara', creadaEn: '2026-11-20T12:00:00.000Z', ramoCodigo: 'MAT1610' },
        ],
      },
    }),
  ]

  it('primero pide elegir la asignatura', async () => {
    renderizar(<Reservas />, { ruta: '/alumno', mocks: mocks() })
    expect(await screen.findByText('¿En qué asignatura necesitas ayuda?')).toBeInTheDocument()
    await userEvent.selectOptions(screen.getByRole('combobox'), 'MAT1610')
    expect(await screen.findByRole('heading', { name: 'Cálculo II' })).toBeInTheDocument()
    // La elección se recuerda para la próxima vez.
    expect(localStorage.getItem(`tutormatch.ramo.alumno.${ALUMNO.id}`)).toBe('MAT1610')
  })

  it('muestra el mes, sin las casillas propias, y navega entre meses', async () => {
    renderizar(<Reservas />, { ruta: '/alumno?ramo=MAT1610', mocks: mocks() })
    expect(await screen.findByText('2 horarios disponibles. Elige un día.')).toBeInTheDocument()
    expect(screen.getByText('Noviembre de 2026')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '26, 2 horarios' })).toBeEnabled()
    expect(screen.getByRole('button', { name: '27, sin horarios, 1 reserva confirmada' })).toBeEnabled()
    expect(screen.getByRole('button', { name: 'Mes anterior' })).toBeDisabled()
    await userEvent.click(screen.getByRole('button', { name: 'Mes siguiente' }))
    expect(screen.getByText('Diciembre de 2026')).toBeInTheDocument()
  })

  it('en el popup del día se inscribe, avisa los choques y muestra al tutor', async () => {
    renderizar(<Reservas />, { ruta: '/alumno?ramo=MAT1610', mocks: mocks() })
    await userEvent.click(await screen.findByRole('button', { name: '26, 2 horarios' }))
    const modal = screen.getByRole('dialog', { name: 'Jueves 26 de noviembre' })
    expect(within(modal).queryByText('Yo mismo')).not.toBeInTheDocument()
    expect(within(modal).getByText('Ya tienes una sesión a esta hora')).toBeInTheDocument()

    await userEvent.click(within(modal).getAllByRole('button', { name: 'Sobre el tutor' })[0])
    expect(await within(modal).findByText('“Muy clara”')).toBeInTheDocument()

    await userEvent.click(within(modal).getByRole('button', { name: 'Inscribirme' }))
    expect(await screen.findByText(/Reserva enviada para el A 08:10/)).toBeInTheDocument()
  })

  it('cancela una reserva propia con confirmación', async () => {
    renderizar(<Reservas />, { ruta: '/alumno?ramo=MAT1610', mocks: mocks() })
    await userEvent.click(await screen.findByRole('button', { name: '27, sin horarios, 1 reserva confirmada' }))
    const modal = screen.getByRole('dialog')
    expect(within(modal).getByText('Tus reservas')).toBeInTheDocument()
    expect(within(modal).getByText('No quedan horarios libres este día.')).toBeInTheDocument()
    await userEvent.click(within(modal).getByRole('button', { name: 'Cancelar' }))
    await userEvent.click(within(modal).getByRole('button', { name: 'Sí, cancelar' }))
    expect(await screen.findByText('Cancelaste la reserva.')).toBeInTheDocument()
  })
})

describe('Mis tutorías', () => {
  it('destaca la próxima, filtra por estado y cancela', async () => {
    renderizar(<MisTutorias />, {
      mocks: [
        CATALOGO,
        mock(MIS_TUTORIAS, {
          sesiones: [
            sesion('r3', '2026-11-30T11:10:00.000Z', 'PENDIENTE', TUTORA),
            sesion('r1', '2026-11-27T12:55:00.000Z', 'CONFIRMADA'),
            sesion('r4', '2026-11-28T12:55:00.000Z', 'CANCELADA'),
          ],
        }),
        mock(CANCELAR_SESION, { cancelarSesion: { __typename: 'Sesion', id: 'r3', estado: 'CANCELADA' } }),
      ],
    })
    expect(await screen.findByText('Cálculo II con Camila Rojas')).toBeInTheDocument()
    expect(screen.getByText('Viernes 27 de noviembre')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Todas (2)' })).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: 'Pendientes (1)' }))
    expect(screen.queryByText('Viernes 27 de noviembre')).not.toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: 'Cancelar' }))
    await userEvent.click(screen.getByRole('button', { name: 'Sí, cancelar' }))
    expect(await screen.findByText('Cancelaste la tutoría.')).toBeInTheDocument()
  })

  it('sin tutorías invita a reservar', async () => {
    renderizar(<MisTutorias />, { mocks: [CATALOGO, mock(MIS_TUTORIAS, { sesiones: [] })] })
    expect(await screen.findByText('No tienes tutorías agendadas.')).toBeInTheDocument()
  })
})

describe('Archivos y Avisos', () => {
  const material = (id: string, tipo: string, titulo: string, ramoCodigo: string, extra: object) => ({
    __typename: 'Material',
    id,
    tipo,
    titulo,
    texto: null,
    archivo: null,
    creadoEn: '2026-11-24T15:00:00.000Z',
    ramoCodigo,
    tutorId: 'tutora-1-largo',
    ...extra,
  })
  const archivo = { __typename: 'Archivo', nombre: 'guia.pdf', tipoMime: 'application/pdf', tamanoBytes: 1024 }
  const VISIBLE = mock(MATERIAL_VISIBLE, {
    material: [
      material('m1', 'ARCHIVO', 'Guía 3', 'MAT1610', { archivo }),
      material('m2', 'ARCHIVO', 'Recursión', 'IIC2233', { archivo }),
      material('m3', 'AVISO', 'Cambio de sala', 'MAT1610', { texto: 'Sala B-204' }),
    ],
  })

  it('agrupa por asignatura y por tutor (con su id mientras el back no traiga el nombre)', async () => {
    renderizar(<ArchivosAlumno />, { mocks: [CATALOGO, VISIBLE] })
    expect(await screen.findByRole('heading', { name: 'Cálculo II' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Programación Avanzada' })).toBeInTheDocument()
    expect(screen.getAllByText('Tutor · id tutora-1')).toHaveLength(2)
    expect(screen.getAllByText('Nuevo')).toHaveLength(2)
    expect(screen.queryByText('Cambio de sala')).not.toBeInTheDocument()
  })

  it('descarga con fetch y avisa si falla', async () => {
    const fetch = vi.fn().mockResolvedValue(new Response(JSON.stringify({ message: 'No existe' }), { status: 404 }))
    vi.stubGlobal('fetch', fetch)
    renderizar(<ArchivosAlumno />, { mocks: [CATALOGO, VISIBLE] })
    // Con el catálogo cargado, Cálculo II (m1) va primero.
    await screen.findByRole('heading', { name: 'Cálculo II' })
    await userEvent.click(screen.getAllByRole('button', { name: 'Descargar' })[0])
    expect(fetch).toHaveBeenCalledWith('/archivos/m1', expect.anything())
    expect(await screen.findByText('No existe')).toBeInTheDocument()
  })

  it('Avisos muestra solo avisos, y un mensaje si no hay', async () => {
    const { unmount } = renderizar(<Avisos />, { mocks: [CATALOGO, VISIBLE] })
    expect(await screen.findByText('Sala B-204')).toBeInTheDocument()
    unmount()
    renderizar(<Avisos />, { mocks: [CATALOGO, mock(MATERIAL_VISIBLE, { material: [] })] })
    expect(await screen.findByText('Todavía no tienes avisos.')).toBeInTheDocument()
  })
})

describe('Reseñas del alumno', () => {
  it('evalúa en dos pasos, avisando que no se puede editar', async () => {
    const finalizada = (id: string, inicio: string, t: typeof TUTORA) => ({
      __typename: 'Sesion',
      id,
      inicio,
      ramoCodigo: 'MAT1610',
      tutorId: t.id,
      tutor: t,
    })
    renderizar(<ResenasAlumno />, {
      mocks: [
        CATALOGO,
        mock(RESENAS_ALUMNO, {
          sesiones: [finalizada('f1', '2026-11-20T11:10:00.000Z', TUTORA), finalizada('f2', '2026-11-18T11:10:00.000Z', CAMILA)],
          misEvaluaciones: [
            { __typename: 'EvaluacionPropia', sesionId: 'f2', nota: 4, comentario: 'Bien explicado', creadaEn: '2026-11-19T12:00:00.000Z' },
          ],
        }),
        mock(EVALUAR, {
          evaluar: { __typename: 'EvaluacionPropia', sesionId: 'f1', nota: 5, comentario: 'Genial', creadaEn: '2026-11-25T12:00:00.000Z' },
        }),
      ],
    })
    expect(await screen.findByText('Bien explicado')).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: '★ Evaluar' }))

    let modal = screen.getByRole('dialog', { name: 'Evaluar tutoría' })
    expect(within(modal).getByRole('button', { name: 'Continuar' })).toBeDisabled()
    await userEvent.click(within(modal).getByRole('radio', { name: '5 de 5: Excelente' }))
    await userEvent.type(within(modal).getByLabelText('Comentario (opcional)'), 'Genial')
    expect(within(modal).getByText('994 caracteres disponibles')).toBeInTheDocument()
    await userEvent.click(within(modal).getByRole('button', { name: 'Continuar' }))

    modal = screen.getByRole('dialog', { name: '¿Enviar la reseña?' })
    expect(modal).toHaveTextContent('Una vez enviada, la reseña no se puede editar ni borrar.')
    await userEvent.click(within(modal).getByRole('button', { name: 'Enviar reseña' }))
    expect(await screen.findByText('¡Gracias! Tu reseña quedó publicada.')).toBeInTheDocument()
  })
})

describe('Perfil y Agente', () => {
  it('invita a inscribirse como tutor', async () => {
    renderizar(<PerfilAlumno />, { ruta: '/alumno/perfil', patron: '/alumno/perfil', mocks: [mock(PERFIL_ALUMNO, { yo: ALUMNO })] })
    await userEvent.click(await screen.findByRole('button', { name: 'Inscribirme como tutor' }))
    expect(await screen.findByTestId('ruta')).toHaveTextContent('/inscripcion-tutor')
    expect(obtenerSesion()?.portal).toBe('tutor')
  })

  it('si ya es tutor, lleva a sus ramos', async () => {
    renderizar(<PerfilAlumno />, { mocks: [mock(PERFIL_ALUMNO, { yo: { ...ALUMNO, esTutor: true } })] })
    expect(await screen.findByText('También eres tutor')).toBeInTheDocument()
    await waitFor(() => expect(obtenerSesion()?.usuario.esTutor).toBe(true))
  })

  it('el agente es un "próximamente" con acceso a Reservas', () => {
    renderizar(<Agente />)
    expect(screen.getByText('Próximamente')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Ir a Reservas' })).toHaveAttribute('href', '/alumno')
  })
})
