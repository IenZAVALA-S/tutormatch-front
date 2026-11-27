import { describe, expect, it, vi } from 'vitest'
import { act, fireEvent, render, renderHook, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Avatar, iniciales } from './Avatar'
import { BotonTema } from './BotonTema'
import { Cargando, CargaInicial } from './Carga'
import { Estrellas, EstrellasInput } from './Estrellas'
import { FondoDorfic } from './FondoDorfic'
import { AreaTexto, AvisoError, BotonNegro, Campo } from './formulario'
import { Boton, Modal } from './Modal'
import { SelectorAsignatura } from './SelectorAsignatura'
import { Toasts, useToasts } from './Toasts'

describe('Avatar', () => {
  it('muestra las iniciales', () => {
    expect(iniciales('Tutora Prueba Larga')).toBe('TP')
    expect(iniciales('  ')).toBe('?')
    render(<Avatar nombre="Camila Rojas" />)
    expect(screen.getByText('CR')).toBeInTheDocument()
  })
})

describe('Estrellas', () => {
  it('describe la nota para lectores de pantalla', () => {
    render(<Estrellas valor={4.25} />)
    expect(screen.getByRole('img', { name: '4,3 de 5 estrellas' })).toBeInTheDocument()
  })

  it('EstrellasInput elige una nota y muestra su nombre', async () => {
    const alCambiar = vi.fn()
    const { rerender } = render(<EstrellasInput valor={0} alCambiar={alCambiar} />)
    expect(screen.getByText('Elige una nota')).toBeInTheDocument()
    await userEvent.click(screen.getByRole('radio', { name: '4 de 5: Buena' }))
    expect(alCambiar).toHaveBeenCalledWith(4)
    rerender(<EstrellasInput valor={4} alCambiar={alCambiar} />)
    expect(screen.getByText('Buena')).toBeInTheDocument()
    fireEvent.mouseEnter(screen.getByRole('radio', { name: '5 de 5: Excelente' }).closest('label')!)
    expect(screen.getByText('Excelente')).toBeInTheDocument()
  })
})

describe('formulario', () => {
  it('Campo y AreaTexto asocian su etiqueta', () => {
    render(
      <>
        <Campo etiqueta="Email" name="email" variante="superficie" />
        <AreaTexto etiqueta="Texto" name="texto" />
      </>,
    )
    expect(screen.getByLabelText('Email')).toHaveAttribute('id', 'email')
    expect(screen.getByLabelText('Texto').tagName).toBe('TEXTAREA')
  })

  it('AvisoError no muestra nada sin mensaje', () => {
    const { container } = render(<AvisoError>{null}</AvisoError>)
    expect(container).toBeEmptyDOMElement()
    render(<AvisoError>Algo falló</AvisoError>)
    expect(screen.getByRole('alert')).toHaveTextContent('Algo falló')
  })

  it('BotonNegro es un botón normal', async () => {
    const clic = vi.fn()
    render(<BotonNegro onClick={clic}>Entrar</BotonNegro>)
    await userEvent.click(screen.getByRole('button', { name: 'Entrar' }))
    expect(clic).toHaveBeenCalled()
  })
})

describe('Modal', () => {
  it('no se muestra cerrado', () => {
    render(
      <Modal abierto={false} titulo="Hola" alCerrar={() => {}}>
        x
      </Modal>,
    )
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('se cierra con Escape, con la X y al hacer clic fuera', async () => {
    const alCerrar = vi.fn()
    render(
      <Modal abierto titulo="Detalle" subtitulo="Sub" ancho="lg" alCerrar={alCerrar} acciones={<Boton>Ok</Boton>}>
        Contenido
      </Modal>,
    )
    expect(screen.getByRole('dialog', { name: 'Detalle' })).toHaveTextContent('Contenido')
    expect(screen.getByText('Sub')).toBeInTheDocument()
    await userEvent.keyboard('{Escape}')
    await userEvent.click(screen.getByRole('button', { name: 'Cerrar' }))
    fireEvent.mouseDown(screen.getByRole('dialog').parentElement!)
    expect(alCerrar).toHaveBeenCalledTimes(3)
  })
})

describe('Toasts', () => {
  it('muestra y cierra solos después de un rato', () => {
    vi.useFakeTimers()
    const { result } = renderHook(() => useToasts(1000))
    act(() => result.current.mostrar('Guardado'))
    act(() => result.current.mostrar('Falló', 'error'))
    const { rerender } = render(<Toasts toasts={result.current.toasts} alCerrar={result.current.cerrar} />)
    expect(screen.getByRole('status')).toHaveTextContent('Guardado')
    expect(screen.getByRole('alert')).toHaveTextContent('Falló')
    act(() => vi.advanceTimersByTime(1100))
    rerender(<Toasts toasts={result.current.toasts} alCerrar={result.current.cerrar} />)
    expect(screen.queryByText('Guardado')).not.toBeInTheDocument()
  })

  it('se cierran con la X', async () => {
    const alCerrar = vi.fn()
    render(<Toasts toasts={[{ id: 7, texto: 'Hola', tono: 'info' }]} alCerrar={alCerrar} />)
    await userEvent.click(screen.getByRole('button', { name: 'Cerrar' }))
    expect(alCerrar).toHaveBeenCalledWith(7)
  })
})

describe('SelectorAsignatura', () => {
  it('lista las opciones y avisa el cambio', async () => {
    const alCambiar = vi.fn()
    render(
      <SelectorAsignatura
        opciones={[
          { codigo: 'MAT1610', nombre: 'Cálculo II' },
          { codigo: 'IIC2233', nombre: 'Programación Avanzada' },
        ]}
        valor={null}
        vacio="Elige…"
        alCambiar={alCambiar}
      />,
    )
    await userEvent.selectOptions(screen.getByLabelText('Asignatura'), 'IIC2233')
    expect(alCambiar).toHaveBeenCalledWith('IIC2233')
    expect(screen.getByRole('option', { name: 'Elige…' })).toBeDisabled()
  })
})

describe('tema', () => {
  it('BotonTema alterna claro y oscuro, y lo recuerda', async () => {
    render(<BotonTema />)
    await userEvent.click(screen.getByRole('button', { name: 'Cambiar a modo oscuro' }))
    expect(document.documentElement).toHaveClass('dark')
    expect(localStorage.getItem('tutormatch.tema')).toBe('oscuro')
    await userEvent.click(screen.getByRole('button', { name: 'Cambiar a modo claro' }))
    expect(document.documentElement).not.toHaveClass('dark')
  })
})

describe('otros', () => {
  it('indicadores de carga y fondo', () => {
    render(
      <>
        <Cargando texto="Buscando…" />
        <CargaInicial />
        <FondoDorfic />
      </>,
    )
    expect(screen.getByText('Buscando…')).toBeInTheDocument()
    expect(document.querySelectorAll('svg path').length).toBeGreaterThan(5)
  })
})
