import { beforeEach, describe, expect, it, vi } from 'vitest'
import { fireEvent, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { RAMOS } from '../../auth/operaciones'
import { conSesion, mock, renderizar, TUTORA } from '../../test/utilidades'
import { ArchivosTutor } from './Archivos'
import { CalendarioTutor } from './Calendario'
import {
  CANCELAR_SESION,
  CONFIRMAR_SESION,
  ELIMINAR_MATERIAL,
  EVALUACIONES_TUTOR,
  FINALIZAR_SESION,
  MARCAR_CASILLA,
  MATERIAL_TUTOR,
  MIS_RAMOS,
  PENDIENTES,
  PERFIL_TUTOR,
  PUBLICAR_AVISO,
  QUITAR_RAMO,
  REACTIVAR_RAMO,
  SEMANA_TUTOR,
} from './operaciones'
import { PerfilTutor } from './Perfil'
import { ResenasTutor } from './Resenas'

// Miércoles 25 de noviembre de 2026, 09:00 en Chile: lunes, martes y el
// bloque A del miércoles ya pasaron.
const AHORA = new Date('2026-11-25T12:00:00.000Z')

const ramo = (codigo: string, nombre: string) => ({ __typename: 'Ramo', codigo, nombre })
const CALCULO = ramo('MAT1610', 'Cálculo II')
const PROGRA = ramo('IIC2233', 'Programación Avanzada')
const FISICA = ramo('FIS1514', 'Electricidad y Magnetismo')
const ramoTutor = (r: ReturnType<typeof ramo>, activo = true) => ({ __typename: 'RamoTutor', activo, ramo: r })

const misRamos = (ramos = [ramoTutor(CALCULO), ramoTutor(PROGRA)]) =>
  mock(MIS_RAMOS, { yo: { __typename: 'Usuario', id: TUTORA.id, ramos } })

const estudiante = { __typename: 'Usuario', id: 'alumno-1', nombre: 'Benja Alumno' }
const sesion = (id: string, inicio: string, estado: string) => ({
  __typename: 'Sesion',
  id,
  inicio,
  estado,
  ramoCodigo: 'MAT1610',
  estudianteId: 'alumno-1',
  estudiante,
})
const casilla = (id: string, inicio: string, ramoCodigo: string, libre = true) => ({
  __typename: 'BloqueDisponibilidad',
  id,
  inicio,
  ramoCodigo,
  libre,
})

const PENDIENTE = sesion('s1', '2026-11-26T12:55:00.000Z', 'PENDIENTE') // jueves B
const CONFIRMADA = sesion('s2', '2026-11-27T12:55:00.000Z', 'CONFIRMADA') // viernes B

beforeEach(() => {
  vi.useFakeTimers({ toFake: ['Date'], now: AHORA })
  conSesion(TUTORA, 'tutor')
})

describe('Calendario del tutor', () => {
  const marcar = vi.fn(() => ({ data: { marcarCasilla: { __typename: 'BloqueDisponibilidad', id: 'nueva' } } }))
  const mocks = () => [
    misRamos(),
    mock(SEMANA_TUTOR, {
      disponibilidad: [
        casilla('c1', '2026-11-26T11:10:00.000Z', 'MAT1610'), // jueves A: disponible
        casilla('c2', '2026-11-26T12:55:00.000Z', 'MAT1610', false),
        casilla('c3', '2026-11-27T12:55:00.000Z', 'MAT1610', false),
        casilla('c4', '2026-11-27T14:40:00.000Z', 'IIC2233'), // viernes C: otro ramo
      ],
      sesiones: [PENDIENTE, CONFIRMADA],
    }),
    mock(PENDIENTES, { sesiones: [PENDIENTE] }),
    { request: { query: MARCAR_CASILLA, variables: () => true }, result: marcar, maxUsageCount: Infinity },
    mock(CONFIRMAR_SESION, { confirmarSesion: { __typename: 'Sesion', id: 's1', estado: 'CONFIRMADA' } }),
    mock(CANCELAR_SESION, { cancelarSesion: { __typename: 'Sesion', id: 's2', estado: 'CANCELADA' } }),
  ]

  it('muestra la semana con cada estado de casilla y el resumen', async () => {
    renderizar(<CalendarioTutor />, { ruta: '/tutor', mocks: mocks() })
    expect(await screen.findByText('Semana del 23 al 27 de noviembre')).toBeInTheDocument()
    await waitFor(() => expect(screen.getByRole('button', { name: 'Desmarcar' })).toBeInTheDocument())
    expect(screen.getByRole('button', { name: 'Aceptar o rechazar' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Ver o cancelar la sesión' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Se cambia desde IIC2233' })).toBeDisabled()
    expect(screen.getAllByRole('button', { name: 'Ya empezó' })).toHaveLength(13) // lunes, martes y miércoles A
    const resumen = screen.getByRole('list', { name: 'Esta semana' })
    expect(resumen).toHaveTextContent('1 disponible')
    expect(resumen).toHaveTextContent('1 pendiente')
    expect(resumen).toHaveTextContent('1 confirmada')
  })

  it('las notificaciones muestran la reserva y se acepta', async () => {
    renderizar(<CalendarioTutor />, { ruta: '/tutor', mocks: mocks() })
    expect(await screen.findByText('Cálculo II · jue 26 nov · B 09:55')).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: 'Aceptar' }))
    expect(await screen.findByText('Reserva aceptada.')).toBeInTheDocument()
  })

  it('marca una casilla libre con el inicio en UTC', async () => {
    renderizar(<CalendarioTutor />, { ruta: '/tutor', mocks: mocks() })
    await screen.findByRole('button', { name: 'Desmarcar' })
    await userEvent.click(screen.getAllByRole('button', { name: 'Marcar como disponible' })[0])
    await waitFor(() => expect(marcar).toHaveBeenCalled())
    // La grilla va fila por fila: la primera libre es el bloque A del viernes 27
    // (08:10 en Chile = 11:10Z; lun–mié A ya pasaron y el jueves A está marcado).
    expect(marcar).toHaveBeenCalledWith(
      expect.objectContaining({ ramoCodigo: 'MAT1610', inicio: '2026-11-27T11:10:00.000Z' }),
    )
  })

  it('marca un día completo', async () => {
    renderizar(<CalendarioTutor />, { ruta: '/tutor', mocks: mocks() })
    await screen.findByRole('button', { name: 'Desmarcar' })
    await userEvent.click(screen.getByTitle('Marcar los 5 bloques libres del miércoles 25 de noviembre'))
    expect(await screen.findByText('Marcaste 5 horarios del miércoles 25 de noviembre.')).toBeInTheDocument()
  })

  it('cancela una sesión confirmada desde el modal', async () => {
    renderizar(<CalendarioTutor />, { ruta: '/tutor', mocks: mocks() })
    await userEvent.click(await screen.findByRole('button', { name: 'Ver o cancelar la sesión' }))
    const modal = screen.getByRole('dialog', { name: 'Sesión confirmada' })
    expect(modal).toHaveTextContent('Benja Alumno')
    await userEvent.click(within(modal).getByRole('button', { name: 'Cancelar sesión' }))
    expect(await screen.findByText('Sesión cancelada.')).toBeInTheDocument()
  })

  it('finaliza una sesión confirmada (para que el alumno pueda evaluarla)', async () => {
    renderizar(<CalendarioTutor />, {
      ruta: '/tutor',
      mocks: [...mocks(), mock(FINALIZAR_SESION, { finalizarSesion: { __typename: 'Sesion', id: 's2', estado: 'FINALIZADA' } })],
    })
    await userEvent.click(await screen.findByRole('button', { name: 'Ver o cancelar la sesión' }))
    await userEvent.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'Finalizar sesión' }))
    expect(await screen.findByText('Sesión finalizada. El alumno ya puede evaluarla.')).toBeInTheDocument()
  })

  it('una sesión confirmada en curso se puede finalizar, pero ya no cancelar', async () => {
    const enCurso = sesion('s3', '2026-11-25T11:10:00.000Z', 'CONFIRMADA') // miércoles A: empezó 08:10
    renderizar(<CalendarioTutor />, {
      ruta: '/tutor',
      mocks: [
        misRamos(),
        mock(SEMANA_TUTOR, {
          disponibilidad: [casilla('c5', '2026-11-25T11:10:00.000Z', 'MAT1610', false)],
          sesiones: [enCurso],
        }),
        mock(PENDIENTES, { sesiones: [] }),
        mock(FINALIZAR_SESION, { finalizarSesion: { __typename: 'Sesion', id: 's3', estado: 'FINALIZADA' } }),
      ],
    })
    await userEvent.click(await screen.findByRole('button', { name: 'Finalizar la sesión' }))
    const modal = screen.getByRole('dialog', { name: 'Sesión en curso' })
    expect(within(modal).queryByRole('button', { name: 'Cancelar sesión' })).not.toBeInTheDocument()
    await userEvent.click(within(modal).getByRole('button', { name: 'Finalizar sesión' }))
    expect(await screen.findByText('Sesión finalizada. El alumno ya puede evaluarla.')).toBeInTheDocument()
  })

  it('sin ramos activos invita a ir al perfil', async () => {
    renderizar(<CalendarioTutor />, { ruta: '/tutor', mocks: [misRamos([]), mock(PENDIENTES, { sesiones: [] }), mock(SEMANA_TUTOR, { disponibilidad: [], sesiones: [] })] })
    expect(await screen.findByText(/No tienes ramos activos/)).toBeInTheDocument()
  })
})

describe('Archivos del tutor', () => {
  const material = [
    {
      __typename: 'Material',
      id: 'm1',
      tipo: 'ARCHIVO',
      titulo: 'Guía 3',
      texto: null,
      creadoEn: '2026-11-24T15:00:00.000Z',
      ramoCodigo: 'MAT1610',
      tutorId: TUTORA.id,
      archivo: { __typename: 'Archivo', nombre: 'guia.pdf', tipoMime: 'application/pdf', tamanoBytes: 2048 },
    },
    {
      __typename: 'Material',
      id: 'm2',
      tipo: 'AVISO',
      titulo: 'Cambio de sala',
      texto: 'Sala B-204',
      creadoEn: '2026-11-24T16:00:00.000Z',
      ramoCodigo: 'MAT1610',
      tutorId: TUTORA.id,
      archivo: null,
    },
  ]
  const mocks = () => [
    misRamos(),
    mock(MATERIAL_TUTOR, { material }),
    mock(ELIMINAR_MATERIAL, { eliminarMaterial: true }),
    mock(PUBLICAR_AVISO, { publicarAviso: { __typename: 'Material', id: 'm3' } }),
  ]

  it('lista archivos y avisos del ramo', async () => {
    renderizar(<ArchivosTutor />, { ruta: '/tutor/archivos', mocks: mocks() })
    expect(await screen.findByText('1 archivo · 1 aviso')).toBeInTheDocument()
    expect(screen.getByText('guia.pdf · PDF · 2 KB')).toBeInTheDocument()
    expect(screen.getByText('Sala B-204')).toBeInTheDocument()
  })

  it('elimina con confirmación', async () => {
    renderizar(<ArchivosTutor />, { ruta: '/tutor/archivos', mocks: mocks() })
    await screen.findByText('Sala B-204')
    await userEvent.click(screen.getAllByRole('button', { name: 'Eliminar' })[1])
    const modal = screen.getByRole('dialog', { name: 'Eliminar material' })
    expect(modal).toHaveTextContent('no se puede deshacer')
    await userEvent.click(within(modal).getByRole('button', { name: 'Eliminar' }))
    expect(await screen.findByText('Se eliminó "Cambio de sala".')).toBeInTheDocument()
  })

  it('publica un aviso', async () => {
    renderizar(<ArchivosTutor />, { ruta: '/tutor/archivos', mocks: mocks() })
    await userEvent.click(await screen.findByRole('button', { name: 'Publicar aviso' }))
    const modal = screen.getByRole('dialog')
    await userEvent.click(within(modal).getByRole('button', { name: 'Publicar' }))
    expect(within(modal).getByRole('alert')).toHaveTextContent('Completa el título y el texto.')
    await userEvent.type(within(modal).getByLabelText('Título'), 'Llevar calculadora')
    await userEvent.type(within(modal).getByLabelText('Texto'), 'Para el viernes')
    await userEvent.click(within(modal).getByRole('button', { name: 'Publicar' }))
    expect(await screen.findByText('Aviso publicado.')).toBeInTheDocument()
  })

  it('sube un archivo: valida el tipo y envía a /archivos', async () => {
    const fetch = vi.fn().mockResolvedValue(new Response(JSON.stringify({ id: 'm9' }), { status: 201 }))
    vi.stubGlobal('fetch', fetch)
    renderizar(<ArchivosTutor />, { ruta: '/tutor/archivos', mocks: mocks() })
    await userEvent.click(await screen.findByRole('button', { name: 'Subir archivo' }))
    const modal = screen.getByRole('dialog')
    const entrada = modal.querySelector('input[type=file]')!
    fireEvent.change(entrada, { target: { files: [new File(['x'], 'notas.txt', { type: 'text/plain' })] } })
    expect(within(modal).getByRole('alert')).toHaveTextContent('Solo se aceptan archivos PDF, PNG o JPEG.')
    fireEvent.change(entrada, { target: { files: [new File(['%PDF'], 'guia-4.pdf', { type: 'application/pdf' })] } })
    expect(within(modal).getByLabelText('Título')).toHaveValue('guia-4')
    await userEvent.click(within(modal).getByRole('button', { name: 'Subir' }))
    expect(await screen.findByText('Archivo subido.')).toBeInTheDocument()
    expect(fetch).toHaveBeenCalledWith('/archivos', expect.objectContaining({ method: 'POST' }))
  })

  it('un ramo quitado se ve, pero no deja subir', async () => {
    renderizar(<ArchivosTutor />, {
      ruta: '/tutor/archivos?ramo=IIC2233',
      mocks: [misRamos([ramoTutor(CALCULO), ramoTutor(PROGRA, false)]), mock(MATERIAL_TUTOR, { material: [] })],
    })
    expect(await screen.findByText(/Quitaste este ramo/)).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Subir archivo' })).not.toBeInTheDocument()
  })
})

describe('Reseñas del tutor', () => {
  it('muestra promedio, distribución y filtra por ramo', async () => {
    const resena = (nota: number, comentario: string, ramoCodigo: string) => ({
      __typename: 'EvaluacionAnonima',
      nota,
      comentario,
      creadaEn: '2026-11-20T12:00:00.000Z',
      ramoCodigo,
    })
    renderizar(<ResenasTutor />, {
      mocks: [
        misRamos(),
        mock(EVALUACIONES_TUTOR, {
          evaluacionesTutor: {
            __typename: 'EvaluacionesTutor',
            promedio: 4.25,
            cantidad: 3,
            evaluaciones: [resena(5, 'Excelente', 'MAT1610'), resena(4, '', 'MAT1610'), resena(4, 'Bien', 'IIC2233')],
          },
        }),
      ],
    })
    expect(await screen.findByText('4,3')).toBeInTheDocument()
    expect(screen.getByText('3 reseñas')).toBeInTheDocument()
    expect(screen.getByText('Sin comentario.')).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: 'Programación Avanzada (1)' }))
    expect(screen.getByText('Bien')).toBeInTheDocument()
    expect(screen.queryByText('Excelente')).not.toBeInTheDocument()
  })
})

describe('Perfil del tutor', () => {
  const yo = (ramos: object[]) => ({
    __typename: 'Usuario',
    ...TUTORA,
    ramos,
    promedioEvaluaciones: 4.25,
    cantidadEvaluaciones: 3,
  })
  const mocks = () => [
    mock(PERFIL_TUTOR, {
      yo: yo([ramoTutor(CALCULO), ramoTutor(PROGRA), ramoTutor(FISICA, false)]),
      ramos: [CALCULO, PROGRA, FISICA, ramo('MAT1620', 'Cálculo III')],
    }),
    mock(QUITAR_RAMO, { quitarRamoTutor: yo([ramoTutor(CALCULO), ramoTutor(PROGRA, false), ramoTutor(FISICA, false)]) }),
    mock(REACTIVAR_RAMO, { reactivarRamoTutor: yo([ramoTutor(CALCULO), ramoTutor(PROGRA), ramoTutor(FISICA)]) }),
    mock(RAMOS, { ramos: [CALCULO, PROGRA, FISICA, ramo('MAT1620', 'Cálculo III')] }),
  ]

  it('muestra datos y ramos, quita y reactiva', async () => {
    renderizar(<PerfilTutor />, { mocks: mocks() })
    expect(await screen.findByText('tutora@test.local')).toBeInTheDocument()
    expect(screen.getByText('de 3')).toBeInTheDocument()

    const fila = (nombre: string) => screen.getByText(nombre).closest('li')!
    await userEvent.click(within(fila('Programación Avanzada')).getByRole('button', { name: 'Quitar' }))
    await userEvent.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'Quitar' }))
    expect(await screen.findByText(/Quitaste Programación Avanzada/)).toBeInTheDocument()

    await userEvent.click(within(fila('Electricidad y Magnetismo')).getByRole('button', { name: 'Reactivar' }))
    expect(await screen.findByText('Electricidad y Magnetismo vuelve a estar activo.')).toBeInTheDocument()
  })

  it('agregar ramos solo ofrece los que no tiene', async () => {
    renderizar(<PerfilTutor />, { mocks: mocks() })
    await userEvent.click(await screen.findByRole('button', { name: '+ Agregar ramos' }))
    expect(await screen.findByRole('checkbox', { name: /Cálculo III/ })).toBeInTheDocument()
    expect(screen.getAllByRole('checkbox')).toHaveLength(1)
  })
})
