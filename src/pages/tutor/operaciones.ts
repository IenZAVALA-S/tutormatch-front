import { graphql } from '../../gql'

/** Ramos del tutor (activos y quitados), para el selector de asignatura. */
export const MIS_RAMOS = graphql(`
  query MisRamos {
    yo {
      id
      ramos {
        activo
        ramo {
          codigo
          nombre
        }
      }
    }
  }
`)

/** Datos de una semana del calendario en una sola consulta. */
export const SEMANA_TUTOR = graphql(`
  query SemanaTutor($tutorId: ID!, $desde: DateTime!, $hasta: DateTime!) {
    disponibilidad(tutorId: $tutorId, desde: $desde, hasta: $hasta) {
      id
      inicio
      ramoCodigo
      libre
    }
    sesiones(tutorId: $tutorId, desde: $desde, hasta: $hasta) {
      id
      inicio
      estado
      ramoCodigo
      estudianteId
      estudiante {
        id
        nombre
      }
    }
  }
`)

/** Reservas por confirmar; se consulta cada 30 s (no hay websockets). */
export const PENDIENTES = graphql(`
  query Pendientes($tutorId: ID!) {
    sesiones(tutorId: $tutorId, estado: PENDIENTE) {
      id
      inicio
      estado
      ramoCodigo
      estudianteId
      estudiante {
        id
        nombre
      }
    }
  }
`)

export const MARCAR_CASILLA = graphql(`
  mutation MarcarCasilla($ramoCodigo: String!, $inicio: DateTime!) {
    marcarCasilla(ramoCodigo: $ramoCodigo, inicio: $inicio) {
      id
    }
  }
`)

export const DESMARCAR_CASILLA = graphql(`
  mutation DesmarcarCasilla($id: ID!) {
    desmarcarCasilla(id: $id)
  }
`)

export const CONFIRMAR_SESION = graphql(`
  mutation ConfirmarSesion($id: ID!) {
    confirmarSesion(id: $id) {
      id
      estado
    }
  }
`)

/** Reseñas anónimas del tutor, con promedio y cantidad. */
export const EVALUACIONES_TUTOR = graphql(`
  query EvaluacionesTutor($tutorId: ID!) {
    evaluacionesTutor(tutorId: $tutorId) {
      promedio
      cantidad
      evaluaciones {
        nota
        comentario
        creadaEn
        ramoCodigo
      }
    }
  }
`)

/** Ramos del perfil, con los datos que se guardan en la sesión. */
export const RAMOS_PERFIL = graphql(`
  fragment RamosPerfil on Usuario {
    ...UsuarioSesion
    ramos {
      activo
      ramo {
        codigo
        nombre
      }
    }
  }
`)

export const PERFIL_TUTOR = graphql(`
  query PerfilTutor {
    yo {
      ...RamosPerfil
      promedioEvaluaciones
      cantidadEvaluaciones
    }
    ramos {
      codigo
      nombre
    }
  }
`)

export const QUITAR_RAMO = graphql(`
  mutation QuitarRamo($ramoCodigo: String!) {
    quitarRamoTutor(ramoCodigo: $ramoCodigo) {
      ...RamosPerfil
    }
  }
`)

export const REACTIVAR_RAMO = graphql(`
  mutation ReactivarRamo($ramoCodigo: String!) {
    reactivarRamoTutor(ramoCodigo: $ramoCodigo) {
      ...RamosPerfil
    }
  }
`)

/** Datos de un material, para listarlo. */
export const MATERIAL_LISTA = graphql(`
  fragment MaterialLista on Material {
    id
    tipo
    titulo
    texto
    creadoEn
    ramoCodigo
    tutorId
    archivo {
      nombre
      tipoMime
      tamanoBytes
    }
  }
`)

/** Material del tutor en un ramo (del más nuevo al más antiguo). */
export const MATERIAL_TUTOR = graphql(`
  query MaterialTutor($tutorId: ID!, $ramoCodigo: String!) {
    material(tutorId: $tutorId, ramoCodigo: $ramoCodigo) {
      ...MaterialLista
    }
  }
`)

export const PUBLICAR_AVISO = graphql(`
  mutation PublicarAviso($ramoCodigo: String!, $titulo: String!, $texto: String!) {
    publicarAviso(ramoCodigo: $ramoCodigo, titulo: $titulo, texto: $texto) {
      id
    }
  }
`)

export const ELIMINAR_MATERIAL = graphql(`
  mutation EliminarMaterial($id: ID!) {
    eliminarMaterial(id: $id)
  }
`)

/** Solo el tutor; pasa una sesión CONFIRMADA a FINALIZADA (y el alumno puede evaluarla). */
export const FINALIZAR_SESION = graphql(`
  mutation FinalizarSesion($id: ID!) {
    finalizarSesion(id: $id) {
      id
      estado
    }
  }
`)

export const CANCELAR_SESION = graphql(`
  mutation CancelarSesion($id: ID!) {
    cancelarSesion(id: $id) {
      id
      estado
    }
  }
`)
