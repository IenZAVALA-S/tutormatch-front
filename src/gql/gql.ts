/* eslint-disable */
import * as types from './graphql';
import type { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';

/**
 * Map of all GraphQL operations in the project.
 *
 * This map has several performance disadvantages:
 * 1. It is not tree-shakeable, so it will include all operations in the project.
 * 2. It is not minifiable, so the string of a GraphQL query will be multiple times inside the bundle.
 * 3. It does not support dead code elimination, so it will add unused operations.
 *
 * Therefore it is highly recommended to use the babel or swc plugin for production.
 * Learn more about it here: https://the-guild.dev/graphql/codegen/plugins/presets/preset-client#reducing-bundle-size
 */
type Documents = {
    "\n  fragment UsuarioSesion on Usuario {\n    id\n    nombre\n    email\n    esTutor\n  }\n": typeof types.UsuarioSesionFragmentDoc,
    "\n  mutation Login($input: LoginInput!) {\n    login(input: $input) {\n      token\n      usuario {\n        ...UsuarioSesion\n      }\n    }\n  }\n": typeof types.LoginDocument,
    "\n  mutation Registro($input: RegistroInput!) {\n    registro(input: $input) {\n      token\n      usuario {\n        ...UsuarioSesion\n      }\n    }\n  }\n": typeof types.RegistroDocument,
    "\n  query Ramos {\n    ramos {\n      codigo\n      nombre\n    }\n  }\n": typeof types.RamosDocument,
    "\n  mutation AgregarRamosTutor($ramos: [InscripcionRamoInput!]!) {\n    agregarRamosTutor(ramos: $ramos) {\n      ...UsuarioSesion\n    }\n  }\n": typeof types.AgregarRamosTutorDocument,
    "\n  query MisRamos {\n    yo {\n      id\n      ramos {\n        activo\n        ramo {\n          codigo\n          nombre\n        }\n      }\n    }\n  }\n": typeof types.MisRamosDocument,
    "\n  query SemanaTutor($tutorId: ID!, $desde: DateTime!, $hasta: DateTime!) {\n    disponibilidad(tutorId: $tutorId, desde: $desde, hasta: $hasta) {\n      id\n      inicio\n      ramoCodigo\n      libre\n    }\n    sesiones(tutorId: $tutorId, desde: $desde, hasta: $hasta) {\n      id\n      inicio\n      estado\n      ramoCodigo\n      estudianteId\n      estudiante {\n        id\n        nombre\n      }\n    }\n  }\n": typeof types.SemanaTutorDocument,
    "\n  query Pendientes($tutorId: ID!) {\n    sesiones(tutorId: $tutorId, estado: PENDIENTE) {\n      id\n      inicio\n      estado\n      ramoCodigo\n      estudianteId\n      estudiante {\n        id\n        nombre\n      }\n    }\n  }\n": typeof types.PendientesDocument,
    "\n  mutation MarcarCasilla($ramoCodigo: String!, $inicio: DateTime!) {\n    marcarCasilla(ramoCodigo: $ramoCodigo, inicio: $inicio) {\n      id\n    }\n  }\n": typeof types.MarcarCasillaDocument,
    "\n  mutation DesmarcarCasilla($id: ID!) {\n    desmarcarCasilla(id: $id)\n  }\n": typeof types.DesmarcarCasillaDocument,
    "\n  mutation ConfirmarSesion($id: ID!) {\n    confirmarSesion(id: $id) {\n      id\n      estado\n    }\n  }\n": typeof types.ConfirmarSesionDocument,
    "\n  mutation CancelarSesion($id: ID!) {\n    cancelarSesion(id: $id) {\n      id\n      estado\n    }\n  }\n": typeof types.CancelarSesionDocument,
};
const documents: Documents = {
    "\n  fragment UsuarioSesion on Usuario {\n    id\n    nombre\n    email\n    esTutor\n  }\n": types.UsuarioSesionFragmentDoc,
    "\n  mutation Login($input: LoginInput!) {\n    login(input: $input) {\n      token\n      usuario {\n        ...UsuarioSesion\n      }\n    }\n  }\n": types.LoginDocument,
    "\n  mutation Registro($input: RegistroInput!) {\n    registro(input: $input) {\n      token\n      usuario {\n        ...UsuarioSesion\n      }\n    }\n  }\n": types.RegistroDocument,
    "\n  query Ramos {\n    ramos {\n      codigo\n      nombre\n    }\n  }\n": types.RamosDocument,
    "\n  mutation AgregarRamosTutor($ramos: [InscripcionRamoInput!]!) {\n    agregarRamosTutor(ramos: $ramos) {\n      ...UsuarioSesion\n    }\n  }\n": types.AgregarRamosTutorDocument,
    "\n  query MisRamos {\n    yo {\n      id\n      ramos {\n        activo\n        ramo {\n          codigo\n          nombre\n        }\n      }\n    }\n  }\n": types.MisRamosDocument,
    "\n  query SemanaTutor($tutorId: ID!, $desde: DateTime!, $hasta: DateTime!) {\n    disponibilidad(tutorId: $tutorId, desde: $desde, hasta: $hasta) {\n      id\n      inicio\n      ramoCodigo\n      libre\n    }\n    sesiones(tutorId: $tutorId, desde: $desde, hasta: $hasta) {\n      id\n      inicio\n      estado\n      ramoCodigo\n      estudianteId\n      estudiante {\n        id\n        nombre\n      }\n    }\n  }\n": types.SemanaTutorDocument,
    "\n  query Pendientes($tutorId: ID!) {\n    sesiones(tutorId: $tutorId, estado: PENDIENTE) {\n      id\n      inicio\n      estado\n      ramoCodigo\n      estudianteId\n      estudiante {\n        id\n        nombre\n      }\n    }\n  }\n": types.PendientesDocument,
    "\n  mutation MarcarCasilla($ramoCodigo: String!, $inicio: DateTime!) {\n    marcarCasilla(ramoCodigo: $ramoCodigo, inicio: $inicio) {\n      id\n    }\n  }\n": types.MarcarCasillaDocument,
    "\n  mutation DesmarcarCasilla($id: ID!) {\n    desmarcarCasilla(id: $id)\n  }\n": types.DesmarcarCasillaDocument,
    "\n  mutation ConfirmarSesion($id: ID!) {\n    confirmarSesion(id: $id) {\n      id\n      estado\n    }\n  }\n": types.ConfirmarSesionDocument,
    "\n  mutation CancelarSesion($id: ID!) {\n    cancelarSesion(id: $id) {\n      id\n      estado\n    }\n  }\n": types.CancelarSesionDocument,
};

/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 *
 *
 * @example
 * ```ts
 * const query = graphql(`query GetUser($id: ID!) { user(id: $id) { name } }`);
 * ```
 *
 * The query argument is unknown!
 * Please regenerate the types.
 */
export function graphql(source: string): unknown;

/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  fragment UsuarioSesion on Usuario {\n    id\n    nombre\n    email\n    esTutor\n  }\n"): (typeof documents)["\n  fragment UsuarioSesion on Usuario {\n    id\n    nombre\n    email\n    esTutor\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation Login($input: LoginInput!) {\n    login(input: $input) {\n      token\n      usuario {\n        ...UsuarioSesion\n      }\n    }\n  }\n"): (typeof documents)["\n  mutation Login($input: LoginInput!) {\n    login(input: $input) {\n      token\n      usuario {\n        ...UsuarioSesion\n      }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation Registro($input: RegistroInput!) {\n    registro(input: $input) {\n      token\n      usuario {\n        ...UsuarioSesion\n      }\n    }\n  }\n"): (typeof documents)["\n  mutation Registro($input: RegistroInput!) {\n    registro(input: $input) {\n      token\n      usuario {\n        ...UsuarioSesion\n      }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query Ramos {\n    ramos {\n      codigo\n      nombre\n    }\n  }\n"): (typeof documents)["\n  query Ramos {\n    ramos {\n      codigo\n      nombre\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation AgregarRamosTutor($ramos: [InscripcionRamoInput!]!) {\n    agregarRamosTutor(ramos: $ramos) {\n      ...UsuarioSesion\n    }\n  }\n"): (typeof documents)["\n  mutation AgregarRamosTutor($ramos: [InscripcionRamoInput!]!) {\n    agregarRamosTutor(ramos: $ramos) {\n      ...UsuarioSesion\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query MisRamos {\n    yo {\n      id\n      ramos {\n        activo\n        ramo {\n          codigo\n          nombre\n        }\n      }\n    }\n  }\n"): (typeof documents)["\n  query MisRamos {\n    yo {\n      id\n      ramos {\n        activo\n        ramo {\n          codigo\n          nombre\n        }\n      }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query SemanaTutor($tutorId: ID!, $desde: DateTime!, $hasta: DateTime!) {\n    disponibilidad(tutorId: $tutorId, desde: $desde, hasta: $hasta) {\n      id\n      inicio\n      ramoCodigo\n      libre\n    }\n    sesiones(tutorId: $tutorId, desde: $desde, hasta: $hasta) {\n      id\n      inicio\n      estado\n      ramoCodigo\n      estudianteId\n      estudiante {\n        id\n        nombre\n      }\n    }\n  }\n"): (typeof documents)["\n  query SemanaTutor($tutorId: ID!, $desde: DateTime!, $hasta: DateTime!) {\n    disponibilidad(tutorId: $tutorId, desde: $desde, hasta: $hasta) {\n      id\n      inicio\n      ramoCodigo\n      libre\n    }\n    sesiones(tutorId: $tutorId, desde: $desde, hasta: $hasta) {\n      id\n      inicio\n      estado\n      ramoCodigo\n      estudianteId\n      estudiante {\n        id\n        nombre\n      }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query Pendientes($tutorId: ID!) {\n    sesiones(tutorId: $tutorId, estado: PENDIENTE) {\n      id\n      inicio\n      estado\n      ramoCodigo\n      estudianteId\n      estudiante {\n        id\n        nombre\n      }\n    }\n  }\n"): (typeof documents)["\n  query Pendientes($tutorId: ID!) {\n    sesiones(tutorId: $tutorId, estado: PENDIENTE) {\n      id\n      inicio\n      estado\n      ramoCodigo\n      estudianteId\n      estudiante {\n        id\n        nombre\n      }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation MarcarCasilla($ramoCodigo: String!, $inicio: DateTime!) {\n    marcarCasilla(ramoCodigo: $ramoCodigo, inicio: $inicio) {\n      id\n    }\n  }\n"): (typeof documents)["\n  mutation MarcarCasilla($ramoCodigo: String!, $inicio: DateTime!) {\n    marcarCasilla(ramoCodigo: $ramoCodigo, inicio: $inicio) {\n      id\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation DesmarcarCasilla($id: ID!) {\n    desmarcarCasilla(id: $id)\n  }\n"): (typeof documents)["\n  mutation DesmarcarCasilla($id: ID!) {\n    desmarcarCasilla(id: $id)\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation ConfirmarSesion($id: ID!) {\n    confirmarSesion(id: $id) {\n      id\n      estado\n    }\n  }\n"): (typeof documents)["\n  mutation ConfirmarSesion($id: ID!) {\n    confirmarSesion(id: $id) {\n      id\n      estado\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation CancelarSesion($id: ID!) {\n    cancelarSesion(id: $id) {\n      id\n      estado\n    }\n  }\n"): (typeof documents)["\n  mutation CancelarSesion($id: ID!) {\n    cancelarSesion(id: $id) {\n      id\n      estado\n    }\n  }\n"];

export function graphql(source: string) {
  return (documents as any)[source] ?? {};
}

export type DocumentType<TDocumentNode extends DocumentNode<any, any>> = TDocumentNode extends DocumentNode<  infer TType,  any>  ? TType  : never;