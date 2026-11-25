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

export const CANCELAR_SESION = graphql(`
  mutation CancelarSesion($id: ID!) {
    cancelarSesion(id: $id) {
      id
      estado
    }
  }
`)
