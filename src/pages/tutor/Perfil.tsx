import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useApolloClient, useMutation, useQuery } from '@apollo/client/react'
import { mensajeError } from '../../apollo/errores'
import { actualizarSesion } from '../../auth/sesion'
import { Avatar } from '../../components/Avatar'
import { Cargando } from '../../components/Carga'
import { Estrellas } from '../../components/Estrellas'
import { FormularioRamos } from '../../components/FormularioRamos'
import { Boton, Modal } from '../../components/Modal'
import { Toasts, useToasts } from '../../components/Toasts'
import { PERFIL_TUTOR, QUITAR_RAMO, REACTIVAR_RAMO } from './operaciones'

const formatoNota = new Intl.NumberFormat('es-CL', { minimumFractionDigits: 1, maximumFractionDigits: 1 })

type RamoFila = { codigo: string; nombre: string; activo: boolean }

/** Perfil del tutor: sus datos y sus ramos (agregar, quitar y reactivar). */
export function PerfilTutor() {
  const cliente = useApolloClient()
  const { toasts, mostrar, cerrar } = useToasts()
  const { data, loading, error } = useQuery(PERFIL_TUTOR)
  const [quitar, { loading: quitando }] = useMutation(QUITAR_RAMO)
  const [reactivar] = useMutation(REACTIVAR_RAMO)
  const [porQuitar, setPorQuitar] = useState<RamoFila | null>(null)
  const [reactivando, setReactivando] = useState<string | null>(null)
  const [agregando, setAgregando] = useState(false)

  if (loading) return <Cargando className="text-texto-suave" />
  if (error || !data) return <p className="text-marca-700 dark:text-marca-300">{mensajeError(error)}</p>

  const yo = data.yo
  const ramos: RamoFila[] = [...yo.ramos]
    .map((r) => ({ codigo: r.ramo.codigo, nombre: r.ramo.nombre, activo: r.activo }))
    .sort((a, b) => Number(b.activo) - Number(a.activo) || a.nombre.localeCompare(b.nombre))
  const activos = ramos.filter((r) => r.activo).length
  const esUltimo = porQuitar?.activo && activos === 1

  async function confirmarQuitar() {
    if (!porQuitar) return
    try {
      const { data: r } = await quitar({ variables: { ramoCodigo: porQuitar.codigo } })
      const usuario = r?.quitarRamoTutor
      setPorQuitar(null)
      if (usuario && !usuario.esTutor) {
        // Sin ramos activos deja de ser tutor: pasa al portal de alumno
        // (RutaTutor redirige al ver portal 'alumno').
        actualizarSesion({ usuario: pickSesion(usuario), portal: 'alumno' })
        return
      }
      if (usuario) actualizarSesion({ usuario: pickSesion(usuario) })
      mostrar(`Quitaste ${porQuitar.nombre}. Puedes reactivarlo cuando quieras.`)
    } catch (e) {
      mostrar(mensajeError(e), 'error')
    }
  }

  async function alReactivar(ramo: RamoFila) {
    setReactivando(ramo.codigo)
    try {
      const { data: r } = await reactivar({ variables: { ramoCodigo: ramo.codigo } })
      if (r) actualizarSesion({ usuario: pickSesion(r.reactivarRamoTutor) })
      mostrar(`${ramo.nombre} vuelve a estar activo.`)
    } catch (e) {
      mostrar(mensajeError(e), 'error')
    } finally {
      setReactivando(null)
    }
  }

  return (
    <div className="space-y-6 pb-10">
      <h1 className="text-3xl font-bold tracking-tight">Perfil</h1>

      {/* Datos */}
      <section className="flex flex-wrap items-center gap-5 rounded-2xl border border-borde bg-superficie/90 p-5 shadow-sm backdrop-blur sm:p-6">
        <Avatar nombre={yo.nombre} tamano="lg" />
        <div className="min-w-0 flex-1">
          <p className="truncate text-2xl font-bold">{yo.nombre}</p>
          <p className="truncate text-texto-suave">{yo.email}</p>
        </div>
        <dl className="flex gap-3 text-center">
          <Dato titulo="Reseñas">
            <Link to="/tutor/resenas" className="group flex flex-col items-center">
              <span className="text-2xl font-black text-marca-600 group-hover:underline dark:text-marca-300">
                {yo.cantidadEvaluaciones > 0 ? formatoNota.format(yo.promedioEvaluaciones) : '–'}
              </span>
              <Estrellas valor={yo.promedioEvaluaciones} tamano="sm" />
              <span className="mt-0.5 text-xs text-texto-suave">{yo.cantidadEvaluaciones} en total</span>
            </Link>
          </Dato>
          <Dato titulo="Ramos activos">
            <span className="text-2xl font-black text-marca-600 dark:text-marca-300">{activos}</span>
            <span className="mt-0.5 block text-xs text-texto-suave">de {ramos.length}</span>
          </Dato>
        </dl>
      </section>

      {/* Ramos */}
      <section className="tarjeta-marca space-y-4 p-4 sm:p-6">
        <header className="flex flex-wrap items-center gap-3">
          <h2 className="mr-auto text-xl font-bold">Mis ramos</h2>
          <Boton tono={agregando ? 'neutro' : 'peligro'} onClick={() => setAgregando((a) => !a)}>
            {agregando ? 'Cerrar' : '+ Agregar ramos'}
          </Boton>
        </header>

        {agregando && (
          <div className="bloque-marca animate-entrar rounded-2xl p-5 text-white sm:p-6">
            <h3 className="font-bold">Agregar ramos</h3>
            <p className="mt-1 mb-4 text-sm text-marca-100">
              Por cada ramo, la nota con que lo aprobaste (4.0 a 7.0) y el periodo. Se guardan todos o ninguno.
            </p>
            <FormularioRamos
              excluir={ramos.map((r) => r.codigo)}
              textoBoton="Agregar ramos"
              alTerminar={async (usuario) => {
                actualizarSesion({ usuario })
                await cliente.refetchQueries({ include: ['PerfilTutor', 'MisRamos'] })
                setAgregando(false)
                mostrar('Ramos agregados.')
              }}
            />
          </div>
        )}

        {ramos.length === 0 ? (
          <p className="text-texto-suave">Todavía no tienes ramos.</p>
        ) : (
          <ul className="space-y-2">
            {ramos.map((r) => (
              <li
                key={r.codigo}
                className={`flex flex-wrap items-center gap-3 rounded-xl border border-borde p-4 transition ${
                  r.activo ? 'bg-superficie shadow-sm' : 'bg-tinta-50/60 dark:bg-tinta-900/40'
                }`}
              >
                <div className="min-w-0 flex-1">
                  <p className={`font-semibold ${r.activo ? '' : 'text-texto-suave'}`}>{r.nombre}</p>
                  <p className="text-xs text-texto-suave">{r.codigo}</p>
                </div>
                <span
                  className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${
                    r.activo
                      ? 'bg-acento-100 text-acento-700 dark:bg-acento-900/50 dark:text-acento-200'
                      : 'bg-tinta-100 text-tinta-500 dark:bg-tinta-700 dark:text-tinta-300'
                  }`}
                >
                  {r.activo ? 'Activo' : 'Quitado'}
                </span>
                {r.activo ? (
                  <Boton onClick={() => setPorQuitar(r)}>Quitar</Boton>
                ) : (
                  <Boton tono="acento" disabled={reactivando === r.codigo} onClick={() => alReactivar(r)}>
                    {reactivando === r.codigo ? 'Reactivando…' : 'Reactivar'}
                  </Boton>
                )}
              </li>
            ))}
          </ul>
        )}
        <p className="text-xs text-texto-suave">
          Un ramo quitado deja de recibir reservas y material nuevo, pero lo ya publicado se sigue viendo. Se reactiva
          sin volver a llenar el formulario.
        </p>
      </section>

      <Modal
        abierto={!!porQuitar}
        titulo={`Quitar ${porQuitar?.nombre ?? ''}`}
        alCerrar={() => !quitando && setPorQuitar(null)}
        acciones={
          <>
            <Boton onClick={() => setPorQuitar(null)} disabled={quitando}>
              Cancelar
            </Boton>
            <Boton tono="peligro" onClick={confirmarQuitar} disabled={quitando}>
              {quitando ? 'Quitando…' : 'Quitar'}
            </Boton>
          </>
        }
      >
        <p>Dejarás de impartir este ramo. Puedes reactivarlo después sin repetir el formulario.</p>
        {esUltimo && (
          <p className="mt-3 rounded-lg bg-sol-100 px-3 py-2 font-medium text-sol-800 dark:bg-sol-800/30 dark:text-sol-200">
            Es tu último ramo activo: dejarás de aparecer como tutor y pasarás al portal de alumno.
          </p>
        )}
      </Modal>

      <Toasts toasts={toasts} alCerrar={cerrar} />
    </div>
  )
}

function Dato({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return (
    <div className="min-w-24 rounded-xl bg-marca-50 px-4 py-3 dark:bg-tinta-700">
      <dt className="mb-1 text-xs font-semibold tracking-wide text-texto-suave uppercase">{titulo}</dt>
      <dd>{children}</dd>
    </div>
  )
}

/** Solo los campos que se guardan en la sesión. */
function pickSesion(u: { __typename?: 'Usuario'; id: string; nombre: string; email: string; esTutor: boolean }) {
  return { __typename: u.__typename, id: u.id, nombre: u.nombre, email: u.email, esTutor: u.esTutor }
}
