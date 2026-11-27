import { useMemo, useState } from 'react'
import { useMutation, useQuery } from '@apollo/client/react'
import { mensajeError } from '../../apollo/errores'
import { useSesion } from '../../auth/useSesion'
import { Cargando } from '../../components/Carga'
import { Boton, Modal } from '../../components/Modal'
import { SelectorAsignatura } from '../../components/SelectorAsignatura'
import { Toasts, useToasts } from '../../components/Toasts'
import type { MaterialListaFragment } from '../../gql/graphql'
import { useRamoElegido } from '../../hooks/useRamoElegido'
import { ItemMaterial } from './archivos/ItemMaterial'
import { ModalAviso } from './archivos/ModalAviso'
import { ModalSubir } from './archivos/ModalSubir'
import { ELIMINAR_MATERIAL, MATERIAL_TUTOR, MIS_RAMOS } from './operaciones'

export function ArchivosTutor() {
  const tutorId = useSesion()!.usuario.id
  const { toasts, mostrar, cerrar } = useToasts()

  // ---- Asignatura: todos sus ramos; los quitados se ven pero no reciben material ----
  const [pedido, elegirRamo] = useRamoElegido('tutor')
  const { data: datosRamos, loading: cargandoRamos, error: errorRamos } = useQuery(MIS_RAMOS)
  const ramos = useMemo(() => datosRamos?.yo.ramos ?? [], [datosRamos])
  const opciones = useMemo(
    () =>
      [...ramos]
        .sort((a, b) => Number(b.activo) - Number(a.activo))
        .map((r) => ({ codigo: r.ramo.codigo, nombre: r.activo ? r.ramo.nombre : `${r.ramo.nombre} (quitado)` })),
    [ramos],
  )
  const elegido = ramos.find((r) => r.ramo.codigo === pedido) ?? ramos.find((r) => r.activo) ?? ramos[0]
  const ramo = elegido?.ramo.codigo ?? null

  // ---- Material ----
  const { data, loading, error, previousData, refetch } = useQuery(MATERIAL_TUTOR, {
    variables: { tutorId, ramoCodigo: ramo ?? '' },
    skip: !ramo,
  })
  const material = (data ?? previousData)?.material ?? []
  const cambiandoRamo = loading && !!previousData

  // ---- Acciones ----
  const [modal, setModal] = useState<'subir' | 'aviso' | null>(null)
  const [porEliminar, setPorEliminar] = useState<MaterialListaFragment | null>(null)
  const [eliminar, { loading: eliminando }] = useMutation(ELIMINAR_MATERIAL, {
    refetchQueries: ['MaterialTutor'],
    awaitRefetchQueries: true,
  })

  async function confirmarEliminar() {
    if (!porEliminar) return
    try {
      await eliminar({ variables: { id: porEliminar.id } })
      mostrar(`Se eliminó "${porEliminar.titulo}".`)
      setPorEliminar(null)
    } catch (e) {
      mostrar(mensajeError(e, { FORBIDDEN: 'Este material no es tuyo.' }), 'error')
    }
  }

  if (cargandoRamos) return <Cargando className="text-texto-suave" />
  if (errorRamos) return <p className="text-marca-700">{mensajeError(errorRamos)}</p>
  if (!elegido || !ramo) {
    return (
      <div className="space-y-4">
        <h1 className="text-3xl font-bold tracking-tight">Archivos</h1>
        <p className="text-texto-suave">Todavía no tienes ramos. Agrégalos desde tu perfil.</p>
      </div>
    )
  }

  const archivos = material.filter((m) => m.tipo === 'ARCHIVO').length
  const avisos = material.length - archivos

  return (
    <div className="space-y-6 pb-28">
      {/* Título de la asignatura con el mismo selector */}
      <header className="flex flex-wrap items-end gap-4">
        <div className="mr-auto min-w-0">
          <p className="text-sm font-semibold text-marca-600 dark:text-marca-300">Archivos</p>
          <h1 className="truncate text-3xl font-bold tracking-tight">{elegido.ramo.nombre}</h1>
        </div>
        <SelectorAsignatura
          opciones={opciones}
          valor={ramo}
          alCambiar={elegirRamo}
          etiqueta="Cambiar asignatura"
          className="w-full sm:w-80"
        />
      </header>

      {!elegido.activo && (
        <p className="rounded-xl border border-sol-200 bg-sol-100/70 px-4 py-3 text-sm text-sol-800 dark:border-sol-800 dark:bg-sol-800/25 dark:text-sol-200">
          Quitaste este ramo: su material se sigue viendo, pero no puedes subir más. Reactívalo desde tu perfil.
        </p>
      )}

      <section className="tarjeta-marca p-4 sm:p-6">
        <p className="mb-4 text-sm text-texto-suave">
          {material.length === 0
            ? 'Sin material'
            : `${archivos} ${archivos === 1 ? 'archivo' : 'archivos'} · ${avisos} ${avisos === 1 ? 'aviso' : 'avisos'}`}
        </p>
        {error && !data ? (
          <p className="text-marca-700 dark:text-marca-300">{mensajeError(error)}</p>
        ) : loading && !previousData ? (
          <Cargando className="text-texto-suave" />
        ) : material.length === 0 ? (
          <div className="rounded-xl border-2 border-dashed border-borde px-6 py-12 text-center text-texto-suave">
            <p className="font-semibold text-texto">Aún no hay material en {elegido.ramo.nombre}.</p>
            {elegido.activo && <p className="mt-1 text-sm">Sube un archivo o publica un aviso con los botones de abajo.</p>}
          </div>
        ) : (
          <ul className={`space-y-3 transition-opacity ${cambiandoRamo ? 'opacity-50' : ''}`}>
            {material.map((m) => (
              <ItemMaterial key={m.id} material={m} alEliminar={setPorEliminar} alError={(t) => mostrar(t, 'error')} />
            ))}
          </ul>
        )}
      </section>

      {/* Acciones abajo a la derecha */}
      {elegido.activo && (
        <div className="fixed right-4 bottom-4 z-30 flex flex-col gap-2 sm:right-6 sm:bottom-6 sm:flex-row">
          <BotonFlotante tono="aviso" onClick={() => setModal('aviso')}>
            Publicar aviso
          </BotonFlotante>
          <BotonFlotante tono="subir" onClick={() => setModal('subir')}>
            Subir archivo
          </BotonFlotante>
        </div>
      )}

      <ModalSubir
        abierto={modal === 'subir'}
        ramoCodigo={ramo}
        nombreRamo={elegido.ramo.nombre}
        alCerrar={() => setModal(null)}
        alSubir={() => {
          // La subida va por REST: Apollo no se entera, así que se recarga la lista a mano.
          void refetch()
          mostrar('Archivo subido.')
        }}
      />
      <ModalAviso
        abierto={modal === 'aviso'}
        ramoCodigo={ramo}
        nombreRamo={elegido.ramo.nombre}
        alCerrar={() => setModal(null)}
        alPublicar={() => mostrar('Aviso publicado.')}
      />
      <Modal
        abierto={!!porEliminar}
        titulo="Eliminar material"
        alCerrar={() => !eliminando && setPorEliminar(null)}
        acciones={
          <>
            <Boton onClick={() => setPorEliminar(null)} disabled={eliminando}>
              Cancelar
            </Boton>
            <Boton tono="peligro" onClick={confirmarEliminar} disabled={eliminando}>
              {eliminando ? 'Eliminando…' : 'Eliminar'}
            </Boton>
          </>
        }
      >
        ¿Eliminar <strong className="text-texto">“{porEliminar?.titulo}”</strong>? Tus alumnos dejarán de verlo y no se
        puede deshacer.
      </Modal>

      <Toasts toasts={toasts} alCerrar={cerrar} />
    </div>
  )
}

function BotonFlotante({
  tono,
  className = '',
  ...resto
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { tono: 'subir' | 'aviso' }) {
  const estilo =
    tono === 'subir'
      ? 'bg-marca-500 text-white hover:bg-marca-600'
      : 'bg-tinta-800 text-white hover:bg-tinta-700 dark:bg-superficie dark:text-texto dark:border dark:border-borde dark:hover:bg-tinta-700'
  return (
    <button
      type="button"
      className={`rounded-full px-5 py-3 font-semibold shadow-boton transition duration-200 hover:-translate-y-0.5 hover:shadow-boton-hover active:translate-y-0 ${estilo} ${className}`}
      {...resto}
    />
  )
}
