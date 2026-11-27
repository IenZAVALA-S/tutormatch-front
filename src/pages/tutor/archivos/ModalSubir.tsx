import { useRef, useState, type DragEvent, type FormEvent } from 'react'
import { AvisoError, Campo } from '../../../components/formulario'
import { Boton, Modal } from '../../../components/Modal'
import { ErrorArchivo, subirArchivo, tamanoLegible, validarArchivo } from '../../../utils/archivos'

interface Props {
  abierto: boolean
  ramoCodigo: string
  nombreRamo: string
  alCerrar: () => void
  alSubir: () => void
}

/** Subir archivo: título y archivo (PDF, PNG o JPEG, hasta 10 MB) → POST /archivos. */
export function ModalSubir({ abierto, ramoCodigo, nombreRamo, alCerrar, alSubir }: Props) {
  const [archivo, setArchivo] = useState<File | null>(null)
  const [titulo, setTitulo] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [enviando, setEnviando] = useState(false)
  const [arrastrando, setArrastrando] = useState(false)
  const entrada = useRef<HTMLInputElement>(null)

  function cerrar() {
    if (enviando) return
    setArchivo(null)
    setTitulo('')
    setError(null)
    alCerrar()
  }

  function elegir(nuevo: File | undefined) {
    if (!nuevo) return
    const problema = validarArchivo(nuevo)
    setError(problema)
    setArchivo(problema ? null : nuevo)
    // Si no hay título, se propone el nombre del archivo sin extensión.
    if (!problema && !titulo.trim()) setTitulo(nuevo.name.replace(/\.[^.]+$/, ''))
  }

  function soltar(e: DragEvent) {
    e.preventDefault()
    setArrastrando(false)
    elegir(e.dataTransfer.files[0])
  }

  async function enviar(e: FormEvent) {
    e.preventDefault()
    if (!archivo) return setError('Elige un archivo.')
    if (!titulo.trim()) return setError('Ponle un título.')
    setEnviando(true)
    setError(null)
    try {
      await subirArchivo({ archivo, ramoCodigo, titulo: titulo.trim() })
      setEnviando(false)
      alSubir()
      cerrar()
    } catch (e) {
      setEnviando(false)
      setError(
        e instanceof ErrorArchivo && e.status === 403
          ? 'No puedes subir material a este ramo porque no lo tienes activo.'
          : e instanceof Error
            ? e.message
            : 'No se pudo subir el archivo.',
      )
    }
  }

  return (
    <Modal
      abierto={abierto}
      titulo={`Subir archivo · ${nombreRamo}`}
      alCerrar={cerrar}
      acciones={
        <>
          <Boton onClick={cerrar} disabled={enviando}>
            Cancelar
          </Boton>
          <Boton tono="peligro" type="submit" form="form-subir" disabled={enviando}>
            {enviando ? 'Subiendo…' : 'Subir'}
          </Boton>
        </>
      }
    >
      <form id="form-subir" onSubmit={enviar} className="space-y-4" noValidate>
        <Campo
          variante="superficie"
          etiqueta="Título"
          name="titulo"
          value={titulo}
          onChange={(e) => setTitulo(e.target.value)}
          placeholder="Guía de ejercicios 3"
          autoFocus
        />
        <div>
          <span className="mb-1 block text-sm font-medium text-texto">Archivo</span>
          <button
            type="button"
            onClick={() => entrada.current?.click()}
            onDragOver={(e) => {
              e.preventDefault()
              setArrastrando(true)
            }}
            onDragLeave={() => setArrastrando(false)}
            onDrop={soltar}
            className={`flex w-full flex-col items-center gap-1 rounded-xl border-2 border-dashed px-4 py-6 text-center transition ${
              arrastrando
                ? 'border-marca-500 bg-marca-50 dark:bg-marca-900/30'
                : 'border-borde hover:border-marca-300 hover:bg-marca-50/60 dark:hover:bg-tinta-700'
            }`}
          >
            {archivo ? (
              <>
                <span className="font-semibold text-texto">{archivo.name}</span>
                <span className="text-xs">{tamanoLegible(archivo.size)} · clic para cambiarlo</span>
              </>
            ) : (
              <>
                <span className="font-semibold text-marca-700 dark:text-marca-300">Elige un archivo o arrástralo aquí</span>
                <span className="text-xs">PDF, PNG o JPEG, hasta 10 MB</span>
              </>
            )}
          </button>
          <input
            ref={entrada}
            type="file"
            accept="application/pdf,image/png,image/jpeg"
            className="hidden"
            onChange={(e) => {
              elegir(e.target.files?.[0])
              e.target.value = ''
            }}
          />
        </div>
        <AvisoError>{error}</AvisoError>
      </form>
    </Modal>
  )
}
