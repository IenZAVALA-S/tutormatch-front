import { graphql } from '../gql'

// Datos del usuario que se guardan en la sesión.
export const USUARIO_SESION = graphql(`
  fragment UsuarioSesion on Usuario {
    id
    nombre
    email
    esTutor
  }
`)

export const LOGIN = graphql(`
  mutation Login($input: LoginInput!) {
    login(input: $input) {
      token
      usuario {
        ...UsuarioSesion
      }
    }
  }
`)

export const REGISTRO = graphql(`
  mutation Registro($input: RegistroInput!) {
    registro(input: $input) {
      token
      usuario {
        ...UsuarioSesion
      }
    }
  }
`)

export const RAMOS = graphql(`
  query Ramos {
    ramos {
      codigo
      nombre
    }
  }
`)

export const AGREGAR_RAMOS_TUTOR = graphql(`
  mutation AgregarRamosTutor($ramos: [InscripcionRamoInput!]!) {
    agregarRamosTutor(ramos: $ramos) {
      ...UsuarioSesion
    }
  }
`)
