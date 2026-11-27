import { graphql } from '../../gql'

/** Datos del tutor que se muestran en las tarjetas. */
export const TUTOR_TARJETA = graphql(`
  fragment TutorTarjeta on Usuario {
    id
    nombre
    promedioEvaluaciones
    cantidadEvaluaciones
  }
`)

/** Casillas libres de todos los tutores de un ramo en un rango (un mes). */
export const DISPONIBILIDAD_RAMO = graphql(`
  query DisponibilidadRamo($ramoCodigo: String!, $desde: DateTime!, $hasta: DateTime!) {
    buscarDisponibilidad(ramoCodigo: $ramoCodigo, desde: $desde, hasta: $hasta) {
      id
      inicio
      ramoCodigo
      tutorId
      tutor {
        ...TutorTarjeta
      }
    }
  }
`)

/**
 * Reservas propias en un rango. `buscarDisponibilidad` solo trae casillas
 * libres, así que las propias salen de aquí y se cruzan con el calendario.
 */
export const MIS_RESERVAS = graphql(`
  query MisReservas($estudianteId: ID!, $desde: DateTime!, $hasta: DateTime!) {
    sesiones(estudianteId: $estudianteId, desde: $desde, hasta: $hasta) {
      id
      inicio
      estado
      ramoCodigo
      tutorId
      tutor {
        ...TutorTarjeta
      }
    }
  }
`)

/** Próximas sesiones del alumno, de todos los ramos. */
export const MIS_TUTORIAS = graphql(`
  query MisTutorias($estudianteId: ID!, $desde: DateTime!) {
    sesiones(estudianteId: $estudianteId, desde: $desde) {
      id
      inicio
      estado
      ramoCodigo
      tutorId
      tutor {
        ...TutorTarjeta
      }
    }
  }
`)

/**
 * Todo el material que el alumno puede ver (el back decide: el de tutores
 * con quienes tiene o tuvo una sesión no cancelada en ese ramo).
 */
export const MATERIAL_VISIBLE = graphql(`
  query MaterialVisible {
    material {
      ...MaterialLista
    }
  }
`)

/** Sesiones finalizadas del alumno (las que se pueden evaluar) y sus evaluaciones. */
export const RESENAS_ALUMNO = graphql(`
  query ResenasAlumno($estudianteId: ID!) {
    sesiones(estudianteId: $estudianteId, estado: FINALIZADA) {
      id
      inicio
      ramoCodigo
      tutorId
      tutor {
        ...TutorTarjeta
      }
    }
    misEvaluaciones {
      sesionId
      nota
      comentario
      creadaEn
    }
  }
`)

/** Una por sesión; no se edita ni se borra. */
export const EVALUAR = graphql(`
  mutation Evaluar($sesionId: ID!, $nota: Int!, $comentario: String) {
    evaluar(sesionId: $sesionId, nota: $nota, comentario: $comentario) {
      sesionId
      nota
      comentario
      creadaEn
    }
  }
`)

/** Datos del perfil del alumno (frescos, por si cambió `esTutor`). */
export const PERFIL_ALUMNO = graphql(`
  query PerfilAlumno {
    yo {
      ...UsuarioSesion
    }
  }
`)

/**
 * Conversación con el agente. Puede tardar hasta unos 2 minutos: no se
 * reintenta. El primer mensaje va sin conversacionId.
 */
export const CHAT_AGENTE = graphql(`
  mutation ChatAgente($mensaje: String!, $conversacionId: String) {
    chatAgente(mensaje: $mensaje, conversacionId: $conversacionId) {
      respuesta
      conversacionId
      acciones {
        id
        tipo
      }
    }
  }
`)

export const CREAR_SESION = graphql(`
  mutation CrearSesion($input: CrearSesionInput!) {
    crearSesion(input: $input) {
      id
      estado
    }
  }
`)
