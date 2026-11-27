import { beforeEach, describe, expect, it, vi } from 'vitest'
import { obtenerSesion } from '../auth/sesion'
import { conSesion } from '../test/utilidades'
import {
  abrirArchivo,
  bajarArchivo,
  descargarArchivo,
  ErrorArchivo,
  etiquetaTipo,
  subirArchivo,
  tamanoLegible,
  validarArchivo,
} from './archivos'

const respuesta = (status: number, cuerpo?: unknown) =>
  new Response(cuerpo === undefined ? null : JSON.stringify(cuerpo), {
    status,
    headers: { 'content-type': 'application/json' },
  })

const archivo = (nombre: string, tipo: string, bytes = 10) => new File([new Uint8Array(bytes)], nombre, { type: tipo })

beforeEach(() => {
  conSesion()
  vi.stubGlobal('URL', Object.assign(URL, { createObjectURL: vi.fn(() => 'blob:prueba'), revokeObjectURL: vi.fn() }))
})

describe('validarArchivo', () => {
  it('acepta PDF, PNG y JPEG de hasta 10 MB', () => {
    expect(validarArchivo(archivo('a.pdf', 'application/pdf'))).toBeNull()
    expect(validarArchivo(archivo('a.png', 'image/png'))).toBeNull()
    expect(validarArchivo(archivo('a.jpg', 'image/jpeg'))).toBeNull()
  })

  it('rechaza otros tipos y lo que pasa de 10 MB', () => {
    expect(validarArchivo(archivo('a.txt', 'text/plain'))).toMatch(/PDF, PNG o JPEG/)
    expect(validarArchivo(archivo('a.pdf', 'application/pdf', 10 * 1024 * 1024 + 1))).toMatch(/10 MB/)
  })
})

describe('formatos', () => {
  it('muestra tamaños legibles', () => {
    expect(tamanoLegible(500)).toBe('500 B')
    expect(tamanoLegible(2048)).toBe('2 KB')
    expect(tamanoLegible(2.5 * 1024 * 1024)).toBe('2,5 MB')
  })

  it('nombra los tipos', () => {
    expect(etiquetaTipo('application/pdf')).toBe('PDF')
    expect(etiquetaTipo('image/jpeg')).toBe('JPEG')
    expect(etiquetaTipo('otro/tipo')).toBe('otro/tipo')
  })
})

describe('bajarArchivo', () => {
  it('pide el archivo con el token en la cabecera (no sirve un <a href> directo)', async () => {
    const fetch = vi.fn().mockResolvedValue(new Response('pdf'))
    vi.stubGlobal('fetch', fetch)
    const blob = await bajarArchivo('m 1')
    expect(await blob.text()).toBe('pdf')
    expect(fetch).toHaveBeenCalledWith('/archivos/m%201', {
      headers: { Authorization: `Bearer ${obtenerSesion()!.token}` },
    })
  })

  it('con 401 limpia la sesión (para volver al login)', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(respuesta(401)))
    await expect(bajarArchivo('x')).rejects.toMatchObject({ status: 401 })
    expect(obtenerSesion()).toBeNull()
  })

  it('usa el mensaje del BFF cuando lo hay', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(respuesta(404, { statusCode: 404, message: 'No existe' })))
    await expect(bajarArchivo('x')).rejects.toThrow('No existe')
  })

  it('tiene un mensaje propio si el cuerpo no es JSON', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('', { status: 503 })))
    await expect(bajarArchivo('x')).rejects.toThrow(/no responde/)
  })
})

describe('descargar y abrir', () => {
  it('descarga con un enlace temporal y libera la URL', async () => {
    vi.useFakeTimers()
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('x')))
    const clic = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {})
    await descargarArchivo('m1', 'guia.pdf')
    expect(clic).toHaveBeenCalled()
    vi.runAllTimers()
    expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:prueba')
  })

  it('abre en una pestaña nueva', async () => {
    const pestana = { location: { href: '' }, close: vi.fn() }
    vi.spyOn(window, 'open').mockReturnValue(pestana as unknown as Window)
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('x')))
    await abrirArchivo('m1')
    expect(pestana.location.href).toBe('blob:prueba')
  })

  it('cierra la pestaña si la descarga falla', async () => {
    const pestana = { location: { href: '' }, close: vi.fn() }
    vi.spyOn(window, 'open').mockReturnValue(pestana as unknown as Window)
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(respuesta(404, { message: 'No existe' })))
    await expect(abrirArchivo('m1')).rejects.toThrow()
    expect(pestana.close).toHaveBeenCalled()
  })
})

describe('subirArchivo', () => {
  it('envía multipart con archivo, ramoCodigo y titulo', async () => {
    const fetch = vi.fn().mockResolvedValue(respuesta(201, { id: 'm1' }))
    vi.stubGlobal('fetch', fetch)
    const creado = await subirArchivo<{ id: string }>({
      archivo: archivo('a.pdf', 'application/pdf'),
      ramoCodigo: 'MAT1610',
      titulo: 'Guía',
    })
    expect(creado.id).toBe('m1')
    const [url, opciones] = fetch.mock.calls[0]
    const cuerpo = opciones.body as FormData
    expect(url).toBe('/archivos')
    expect(opciones.method).toBe('POST')
    expect(cuerpo.get('ramoCodigo')).toBe('MAT1610')
    expect(cuerpo.get('titulo')).toBe('Guía')
  })

  it('no envía nada si el archivo no es válido', async () => {
    const fetch = vi.fn()
    vi.stubGlobal('fetch', fetch)
    await expect(
      subirArchivo({ archivo: archivo('a.txt', 'text/plain'), ramoCodigo: 'X', titulo: 'T' }),
    ).rejects.toBeInstanceOf(ErrorArchivo)
    expect(fetch).not.toHaveBeenCalled()
  })

  it('traduce el 413 (que viene en inglés)', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(respuesta(413, { message: 'File too large' })))
    await expect(
      subirArchivo({ archivo: archivo('a.pdf', 'application/pdf'), ramoCodigo: 'X', titulo: 'T' }),
    ).rejects.toThrow('El archivo pesa más de 10 MB.')
  })
})
