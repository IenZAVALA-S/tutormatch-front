// Archivos del material: van por REST (/archivos), no por GraphQL.
// GET /archivos/:id pide el token en la cabecera, así que un <img src> o un
// <a href> directo da 401: se baja con fetch, se arma un blob y se usa
// URL.createObjectURL (y URL.revokeObjectURL al terminar).

import { limpiarSesion, obtenerToken } from '../auth/sesion'

export const TIPOS_PERMITIDOS = ['application/pdf', 'image/png', 'image/jpeg'] as const
export const TAMANO_MAXIMO = 10 * 1024 * 1024 // 10 MB

/** Error de /archivos (Nest responde { statusCode, message, error }). */
export class ErrorArchivo extends Error {
  readonly status: number
  constructor(status: number, mensaje: string) {
    super(mensaje)
    this.name = 'ErrorArchivo'
    this.status = status
  }
}

const MENSAJES: Record<number, string> = {
  400: 'El archivo no es válido.',
  401: 'Tu sesión venció. Vuelve a iniciar sesión.',
  403: 'No tienes este ramo activo.',
  404: 'El archivo no existe o no tienes permiso para verlo.',
  413: 'El archivo pesa más de 10 MB.',
  503: 'El servicio de archivos no responde. Intenta de nuevo en un rato.',
}

async function aError(respuesta: Response): Promise<ErrorArchivo> {
  // Token vencido: se limpia la sesión y RutaProtegida manda al login.
  if (respuesta.status === 401) limpiarSesion()
  let mensaje = MENSAJES[respuesta.status] ?? `Error ${respuesta.status}`
  // El 413 viene en inglés y el 401 no aporta: se usa el mensaje propio.
  // En el resto se prefiere el del BFF.
  if (respuesta.status !== 413 && respuesta.status !== 401) {
    try {
      const cuerpo = (await respuesta.json()) as { message?: string | string[] }
      const delBack = Array.isArray(cuerpo.message) ? cuerpo.message.join('. ') : cuerpo.message
      if (delBack) mensaje = delBack
    } catch {
      // Cuerpo vacío o no JSON.
    }
  }
  return new ErrorArchivo(respuesta.status, mensaje)
}

function cabeceraAutorizacion(): Record<string, string> {
  const token = obtenerToken()
  return token ? { Authorization: `Bearer ${token}` } : {}
}

/** Baja el archivo de un material como blob. */
export async function bajarArchivo(id: string): Promise<Blob> {
  const respuesta = await fetch(`/archivos/${encodeURIComponent(id)}`, {
    headers: cabeceraAutorizacion(),
  })
  if (!respuesta.ok) throw await aError(respuesta)
  return respuesta.blob()
}

/** Abre el archivo (PDF o imagen) en una pestaña nueva. */
export async function abrirArchivo(id: string): Promise<void> {
  // La pestaña se abre antes del await para que el navegador no la bloquee.
  const pestana = window.open('', '_blank')
  try {
    const url = URL.createObjectURL(await bajarArchivo(id))
    if (pestana) pestana.location.href = url
    else window.open(url, '_blank')
    // La pestaña necesita la URL mientras carga; después se libera.
    setTimeout(() => URL.revokeObjectURL(url), 60_000)
  } catch (error) {
    pestana?.close()
    throw error
  }
}

/** Descarga el archivo con el nombre dado. */
export async function descargarArchivo(id: string, nombreArchivo: string): Promise<void> {
  const url = URL.createObjectURL(await bajarArchivo(id))
  try {
    const enlace = document.createElement('a')
    enlace.href = url
    enlace.download = nombreArchivo
    document.body.appendChild(enlace)
    enlace.click()
    enlace.remove()
  } finally {
    setTimeout(() => URL.revokeObjectURL(url), 0)
  }
}

/** Valida tipo y tamaño antes de subir. Devuelve el mensaje de error o null. */
export function validarArchivo(archivo: File): string | null {
  if (!(TIPOS_PERMITIDOS as readonly string[]).includes(archivo.type)) {
    return 'Solo se aceptan archivos PDF, PNG o JPEG.'
  }
  if (archivo.size > TAMANO_MAXIMO) return 'El archivo pesa más de 10 MB.'
  return null
}

/**
 * Sube un archivo como material (POST /archivos, multipart).
 * Responde 201 con el `Material` creado; quien llama pone el tipo
 * (usar el generado por codegen).
 */
export async function subirArchivo<T = unknown>(datos: {
  archivo: File
  ramoCodigo: string
  titulo: string
}): Promise<T> {
  const error = validarArchivo(datos.archivo)
  if (error) throw new ErrorArchivo(400, error)

  const formulario = new FormData()
  formulario.append('archivo', datos.archivo)
  formulario.append('ramoCodigo', datos.ramoCodigo)
  formulario.append('titulo', datos.titulo)

  const respuesta = await fetch('/archivos', {
    method: 'POST',
    headers: cabeceraAutorizacion(),
    body: formulario,
  })
  if (!respuesta.ok) throw await aError(respuesta)
  return (await respuesta.json()) as T
}
