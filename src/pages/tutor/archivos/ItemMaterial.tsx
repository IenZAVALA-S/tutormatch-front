import { useState } from 'react'
import type { MaterialListaFragment } from '../../../gql/graphql'
import { Boton } from '../../../components/Modal'
import { abrirArchivo, descargarArchivo, etiquetaTipo, tamanoLegible } from '../../../utils/archivos'
import { formatoChile } from '../../../utils/bloques'

interface Props {
  material: MaterialListaFragment
  /** Si no se da, no se muestra el botón Eliminar (vista del alumno). */
  alEliminar?: (material: MaterialListaFragment) => void
  alError: (mensaje: string) => void
  /** Muestra "Nuevo" si se publicó hace menos de 3 días (vista del alumno). */
  marcarNuevo?: boolean
}

const TRES_DIAS_MS = 3 * 24 * 60 * 60 * 1000

/** Un archivo o aviso en una lista de material. */
export function ItemMaterial({ material, alEliminar, alError, marcarNuevo = false }: Props) {
  const [bajando, setBajando] = useState<'ver' | 'descargar' | null>(null)
  const { archivo } = material
  const nuevo = marcarNuevo && Date.now() - new Date(material.creadoEn).getTime() < TRES_DIAS_MS

  async function bajar(modo: 'ver' | 'descargar') {
    setBajando(modo)
    try {
      if (modo === 'ver') await abrirArchivo(material.id)
      else await descargarArchivo(material.id, archivo?.nombre ?? material.titulo)
    } catch (e) {
      alError(e instanceof Error ? e.message : 'No se pudo bajar el archivo.')
    } finally {
      setBajando(null)
    }
  }

  return (
    <li className="flex animate-entrar flex-wrap items-start gap-4 rounded-xl border border-borde bg-superficie p-4 shadow-sm transition hover:border-marca-200 hover:shadow-md dark:hover:border-marca-800">
      <Icono material={material} />
      <div className="min-w-0 flex-1">
        <p className="flex flex-wrap items-center gap-2 font-semibold">
          {material.titulo}
          {nuevo && (
            <span className="rounded-full bg-marca-500 px-2 py-0.5 text-[0.65rem] font-bold tracking-wide text-white uppercase">
              Nuevo
            </span>
          )}
        </p>
        {archivo ? (
          <p className="mt-0.5 truncate text-sm text-texto-suave">
            {archivo.nombre} · {etiquetaTipo(archivo.tipoMime)} · {tamanoLegible(archivo.tamanoBytes)}
          </p>
        ) : (
          <p className="mt-1 text-sm whitespace-pre-line text-texto-suave">{material.texto}</p>
        )}
        <p className="mt-1 text-xs text-texto-suave">{formatoChile(material.creadoEn, "d 'de' MMMM 'de' yyyy, HH:mm")}</p>
      </div>
      <div className="flex flex-wrap gap-2">
        {archivo && (
          <>
            <Boton disabled={bajando !== null} onClick={() => bajar('ver')}>
              {bajando === 'ver' ? 'Abriendo…' : 'Ver'}
            </Boton>
            <Boton disabled={bajando !== null} onClick={() => bajar('descargar')}>
              {bajando === 'descargar' ? 'Bajando…' : 'Descargar'}
            </Boton>
          </>
        )}
        {alEliminar && (
          <Boton
            className="text-marca-700 hover:bg-marca-50 dark:text-marca-300 dark:hover:bg-marca-900/40"
            onClick={() => alEliminar(material)}
          >
            Eliminar
          </Boton>
        )}
      </div>
    </li>
  )
}

function Icono({ material }: { material: MaterialListaFragment }) {
  const tipo = material.archivo ? etiquetaTipo(material.archivo.tipoMime) : 'AVISO'
  const estilo =
    tipo === 'PDF'
      ? 'bg-marca-100 text-marca-700 dark:bg-marca-900/50 dark:text-marca-200'
      : tipo === 'AVISO'
        ? 'bg-sol-100 text-sol-800 dark:bg-sol-800/30 dark:text-sol-200'
        : 'bg-acento-100 text-acento-700 dark:bg-acento-900/50 dark:text-acento-200'
  return (
    <span
      aria-hidden
      className={`grid h-12 w-12 shrink-0 place-items-center rounded-xl text-[0.65rem] font-black tracking-wide ${estilo}`}
    >
      {tipo}
    </span>
  )
}
