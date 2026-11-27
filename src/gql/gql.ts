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
    "\n  query Prueba {\n    ramos {\n      codigo\n    }\n  }\n": typeof types.PruebaDocument,
    "\n  fragment UsuarioSesion on Usuario {\n    id\n    nombre\n    email\n    esTutor\n  }\n": typeof types.UsuarioSesionFragmentDoc,
    "\n  mutation Login($input: LoginInput!) {\n    login(input: $input) {\n      token\n      usuario {\n        ...UsuarioSesion\n      }\n    }\n  }\n": typeof types.LoginDocument,
    "\n  mutation Registro($input: RegistroInput!) {\n    registro(input: $input) {\n      token\n      usuario {\n        ...UsuarioSesion\n      }\n    }\n  }\n": typeof types.RegistroDocument,
    "\n  query Ramos {\n    ramos {\n      codigo\n      nombre\n    }\n  }\n": typeof types.RamosDocument,
    "\n  mutation AgregarRamosTutor($ramos: [InscripcionRamoInput!]!) {\n    agregarRamosTutor(ramos: $ramos) {\n      ...UsuarioSesion\n    }\n  }\n": typeof types.AgregarRamosTutorDocument,
    "\n  fragment TutorTarjeta on Usuario {\n    id\n    nombre\n    promedioEvaluaciones\n    cantidadEvaluaciones\n  }\n": typeof types.TutorTarjetaFragmentDoc,
    "\n  query DisponibilidadRamo($ramoCodigo: String!, $desde: DateTime!, $hasta: DateTime!) {\n    buscarDisponibilidad(ramoCodigo: $ramoCodigo, desde: $desde, hasta: $hasta) {\n      id\n      inicio\n      ramoCodigo\n      tutorId\n      tutor {\n        ...TutorTarjeta\n      }\n    }\n  }\n": typeof types.DisponibilidadRamoDocument,
    "\n  query MisReservas($estudianteId: ID!, $desde: DateTime!, $hasta: DateTime!) {\n    sesiones(estudianteId: $estudianteId, desde: $desde, hasta: $hasta) {\n      id\n      inicio\n      estado\n      ramoCodigo\n      tutorId\n      tutor {\n        ...TutorTarjeta\n      }\n    }\n  }\n": typeof types.MisReservasDocument,
    "\n  query MisTutorias($estudianteId: ID!, $desde: DateTime!) {\n    sesiones(estudianteId: $estudianteId, desde: $desde) {\n      id\n      inicio\n      estado\n      ramoCodigo\n      tutorId\n      tutor {\n        ...TutorTarjeta\n      }\n    }\n  }\n": typeof types.MisTutoriasDocument,
    "\n  query MaterialVisible {\n    material {\n      ...MaterialLista\n    }\n  }\n": typeof types.MaterialVisibleDocument,
    "\n  query ResenasAlumno($estudianteId: ID!) {\n    sesiones(estudianteId: $estudianteId, estado: FINALIZADA) {\n      id\n      inicio\n      ramoCodigo\n      tutorId\n      tutor {\n        ...TutorTarjeta\n      }\n    }\n    misEvaluaciones {\n      sesionId\n      nota\n      comentario\n      creadaEn\n    }\n  }\n": typeof types.ResenasAlumnoDocument,
    "\n  mutation Evaluar($sesionId: ID!, $nota: Int!, $comentario: String) {\n    evaluar(sesionId: $sesionId, nota: $nota, comentario: $comentario) {\n      sesionId\n      nota\n      comentario\n      creadaEn\n    }\n  }\n": typeof types.EvaluarDocument,
    "\n  query PerfilAlumno {\n    yo {\n      ...UsuarioSesion\n    }\n  }\n": typeof types.PerfilAlumnoDocument,
    "\n  mutation ChatAgente($mensaje: String!, $conversacionId: String) {\n    chatAgente(mensaje: $mensaje, conversacionId: $conversacionId) {\n      respuesta\n      conversacionId\n      acciones {\n        id\n        tipo\n      }\n    }\n  }\n": typeof types.ChatAgenteDocument,
    "\n  mutation CrearSesion($input: CrearSesionInput!) {\n    crearSesion(input: $input) {\n      id\n      estado\n    }\n  }\n": typeof types.CrearSesionDocument,
    "\n  query MisRamos {\n    yo {\n      id\n      ramos {\n        activo\n        ramo {\n          codigo\n          nombre\n        }\n      }\n    }\n  }\n": typeof types.MisRamosDocument,
    "\n  query SemanaTutor($tutorId: ID!, $desde: DateTime!, $hasta: DateTime!) {\n    disponibilidad(tutorId: $tutorId, desde: $desde, hasta: $hasta) {\n      id\n      inicio\n      ramoCodigo\n      libre\n    }\n    sesiones(tutorId: $tutorId, desde: $desde, hasta: $hasta) {\n      id\n      inicio\n      estado\n      ramoCodigo\n      estudianteId\n      estudiante {\n        id\n        nombre\n      }\n    }\n  }\n": typeof types.SemanaTutorDocument,
    "\n  query Pendientes($tutorId: ID!) {\n    sesiones(tutorId: $tutorId, estado: PENDIENTE) {\n      id\n      inicio\n      estado\n      ramoCodigo\n      estudianteId\n      estudiante {\n        id\n        nombre\n      }\n    }\n  }\n": typeof types.PendientesDocument,
    "\n  mutation MarcarCasilla($ramoCodigo: String!, $inicio: DateTime!) {\n    marcarCasilla(ramoCodigo: $ramoCodigo, inicio: $inicio) {\n      id\n    }\n  }\n": typeof types.MarcarCasillaDocument,
    "\n  mutation DesmarcarCasilla($id: ID!) {\n    desmarcarCasilla(id: $id)\n  }\n": typeof types.DesmarcarCasillaDocument,
    "\n  mutation ConfirmarSesion($id: ID!) {\n    confirmarSesion(id: $id) {\n      id\n      estado\n    }\n  }\n": typeof types.ConfirmarSesionDocument,
    "\n  query EvaluacionesTutor($tutorId: ID!) {\n    evaluacionesTutor(tutorId: $tutorId) {\n      promedio\n      cantidad\n      evaluaciones {\n        nota\n        comentario\n        creadaEn\n        ramoCodigo\n      }\n    }\n  }\n": typeof types.EvaluacionesTutorDocument,
    "\n  fragment RamosPerfil on Usuario {\n    ...UsuarioSesion\n    ramos {\n      activo\n      ramo {\n        codigo\n        nombre\n      }\n    }\n  }\n": typeof types.RamosPerfilFragmentDoc,
    "\n  query PerfilTutor {\n    yo {\n      ...RamosPerfil\n      promedioEvaluaciones\n      cantidadEvaluaciones\n    }\n    ramos {\n      codigo\n      nombre\n    }\n  }\n": typeof types.PerfilTutorDocument,
    "\n  mutation QuitarRamo($ramoCodigo: String!) {\n    quitarRamoTutor(ramoCodigo: $ramoCodigo) {\n      ...RamosPerfil\n    }\n  }\n": typeof types.QuitarRamoDocument,
    "\n  mutation ReactivarRamo($ramoCodigo: String!) {\n    reactivarRamoTutor(ramoCodigo: $ramoCodigo) {\n      ...RamosPerfil\n    }\n  }\n": typeof types.ReactivarRamoDocument,
    "\n  fragment MaterialLista on Material {\n    id\n    tipo\n    titulo\n    texto\n    creadoEn\n    ramoCodigo\n    tutorId\n    archivo {\n      nombre\n      tipoMime\n      tamanoBytes\n    }\n  }\n": typeof types.MaterialListaFragmentDoc,
    "\n  query MaterialTutor($tutorId: ID!, $ramoCodigo: String!) {\n    material(tutorId: $tutorId, ramoCodigo: $ramoCodigo) {\n      ...MaterialLista\n    }\n  }\n": typeof types.MaterialTutorDocument,
    "\n  mutation PublicarAviso($ramoCodigo: String!, $titulo: String!, $texto: String!) {\n    publicarAviso(ramoCodigo: $ramoCodigo, titulo: $titulo, texto: $texto) {\n      id\n    }\n  }\n": typeof types.PublicarAvisoDocument,
    "\n  mutation EliminarMaterial($id: ID!) {\n    eliminarMaterial(id: $id)\n  }\n": typeof types.EliminarMaterialDocument,
    "\n  mutation FinalizarSesion($id: ID!) {\n    finalizarSesion(id: $id) {\n      id\n      estado\n    }\n  }\n": typeof types.FinalizarSesionDocument,
    "\n  mutation CancelarSesion($id: ID!) {\n    cancelarSesion(id: $id) {\n      id\n      estado\n    }\n  }\n": typeof types.CancelarSesionDocument,
};
const documents: Documents = {
    "\n  query Prueba {\n    ramos {\n      codigo\n    }\n  }\n": types.PruebaDocument,
    "\n  fragment UsuarioSesion on Usuario {\n    id\n    nombre\n    email\n    esTutor\n  }\n": types.UsuarioSesionFragmentDoc,
    "\n  mutation Login($input: LoginInput!) {\n    login(input: $input) {\n      token\n      usuario {\n        ...UsuarioSesion\n      }\n    }\n  }\n": types.LoginDocument,
    "\n  mutation Registro($input: RegistroInput!) {\n    registro(input: $input) {\n      token\n      usuario {\n        ...UsuarioSesion\n      }\n    }\n  }\n": types.RegistroDocument,
    "\n  query Ramos {\n    ramos {\n      codigo\n      nombre\n    }\n  }\n": types.RamosDocument,
    "\n  mutation AgregarRamosTutor($ramos: [InscripcionRamoInput!]!) {\n    agregarRamosTutor(ramos: $ramos) {\n      ...UsuarioSesion\n    }\n  }\n": types.AgregarRamosTutorDocument,
    "\n  fragment TutorTarjeta on Usuario {\n    id\n    nombre\n    promedioEvaluaciones\n    cantidadEvaluaciones\n  }\n": types.TutorTarjetaFragmentDoc,
    "\n  query DisponibilidadRamo($ramoCodigo: String!, $desde: DateTime!, $hasta: DateTime!) {\n    buscarDisponibilidad(ramoCodigo: $ramoCodigo, desde: $desde, hasta: $hasta) {\n      id\n      inicio\n      ramoCodigo\n      tutorId\n      tutor {\n        ...TutorTarjeta\n      }\n    }\n  }\n": types.DisponibilidadRamoDocument,
    "\n  query MisReservas($estudianteId: ID!, $desde: DateTime!, $hasta: DateTime!) {\n    sesiones(estudianteId: $estudianteId, desde: $desde, hasta: $hasta) {\n      id\n      inicio\n      estado\n      ramoCodigo\n      tutorId\n      tutor {\n        ...TutorTarjeta\n      }\n    }\n  }\n": types.MisReservasDocument,
    "\n  query MisTutorias($estudianteId: ID!, $desde: DateTime!) {\n    sesiones(estudianteId: $estudianteId, desde: $desde) {\n      id\n      inicio\n      estado\n      ramoCodigo\n      tutorId\n      tutor {\n        ...TutorTarjeta\n      }\n    }\n  }\n": types.MisTutoriasDocument,
    "\n  query MaterialVisible {\n    material {\n      ...MaterialLista\n    }\n  }\n": types.MaterialVisibleDocument,
    "\n  query ResenasAlumno($estudianteId: ID!) {\n    sesiones(estudianteId: $estudianteId, estado: FINALIZADA) {\n      id\n      inicio\n      ramoCodigo\n      tutorId\n      tutor {\n        ...TutorTarjeta\n      }\n    }\n    misEvaluaciones {\n      sesionId\n      nota\n      comentario\n      creadaEn\n    }\n  }\n": types.ResenasAlumnoDocument,
    "\n  mutation Evaluar($sesionId: ID!, $nota: Int!, $comentario: String) {\n    evaluar(sesionId: $sesionId, nota: $nota, comentario: $comentario) {\n      sesionId\n      nota\n      comentario\n      creadaEn\n    }\n  }\n": types.EvaluarDocument,
    "\n  query PerfilAlumno {\n    yo {\n      ...UsuarioSesion\n    }\n  }\n": types.PerfilAlumnoDocument,
    "\n  mutation ChatAgente($mensaje: String!, $conversacionId: String) {\n    chatAgente(mensaje: $mensaje, conversacionId: $conversacionId) {\n      respuesta\n      conversacionId\n      acciones {\n        id\n        tipo\n      }\n    }\n  }\n": types.ChatAgenteDocument,
    "\n  mutation CrearSesion($input: CrearSesionInput!) {\n    crearSesion(input: $input) {\n      id\n      estado\n    }\n  }\n": types.CrearSesionDocument,
    "\n  query MisRamos {\n    yo {\n      id\n      ramos {\n        activo\n        ramo {\n          codigo\n          nombre\n        }\n      }\n    }\n  }\n": types.MisRamosDocument,
    "\n  query SemanaTutor($tutorId: ID!, $desde: DateTime!, $hasta: DateTime!) {\n    disponibilidad(tutorId: $tutorId, desde: $desde, hasta: $hasta) {\n      id\n      inicio\n      ramoCodigo\n      libre\n    }\n    sesiones(tutorId: $tutorId, desde: $desde, hasta: $hasta) {\n      id\n      inicio\n      estado\n      ramoCodigo\n      estudianteId\n      estudiante {\n        id\n        nombre\n      }\n    }\n  }\n": types.SemanaTutorDocument,
    "\n  query Pendientes($tutorId: ID!) {\n    sesiones(tutorId: $tutorId, estado: PENDIENTE) {\n      id\n      inicio\n      estado\n      ramoCodigo\n      estudianteId\n      estudiante {\n        id\n        nombre\n      }\n    }\n  }\n": types.PendientesDocument,
    "\n  mutation MarcarCasilla($ramoCodigo: String!, $inicio: DateTime!) {\n    marcarCasilla(ramoCodigo: $ramoCodigo, inicio: $inicio) {\n      id\n    }\n  }\n": types.MarcarCasillaDocument,
    "\n  mutation DesmarcarCasilla($id: ID!) {\n    desmarcarCasilla(id: $id)\n  }\n": types.DesmarcarCasillaDocument,
    "\n  mutation ConfirmarSesion($id: ID!) {\n    confirmarSesion(id: $id) {\n      id\n      estado\n    }\n  }\n": types.ConfirmarSesionDocument,
    "\n  query EvaluacionesTutor($tutorId: ID!) {\n    evaluacionesTutor(tutorId: $tutorId) {\n      promedio\n      cantidad\n      evaluaciones {\n        nota\n        comentario\n        creadaEn\n        ramoCodigo\n      }\n    }\n  }\n": types.EvaluacionesTutorDocument,
    "\n  fragment RamosPerfil on Usuario {\n    ...UsuarioSesion\n    ramos {\n      activo\n      ramo {\n        codigo\n        nombre\n      }\n    }\n  }\n": types.RamosPerfilFragmentDoc,
    "\n  query PerfilTutor {\n    yo {\n      ...RamosPerfil\n      promedioEvaluaciones\n      cantidadEvaluaciones\n    }\n    ramos {\n      codigo\n      nombre\n    }\n  }\n": types.PerfilTutorDocument,
    "\n  mutation QuitarRamo($ramoCodigo: String!) {\n    quitarRamoTutor(ramoCodigo: $ramoCodigo) {\n      ...RamosPerfil\n    }\n  }\n": types.QuitarRamoDocument,
    "\n  mutation ReactivarRamo($ramoCodigo: String!) {\n    reactivarRamoTutor(ramoCodigo: $ramoCodigo) {\n      ...RamosPerfil\n    }\n  }\n": types.ReactivarRamoDocument,
    "\n  fragment MaterialLista on Material {\n    id\n    tipo\n    titulo\n    texto\n    creadoEn\n    ramoCodigo\n    tutorId\n    archivo {\n      nombre\n      tipoMime\n      tamanoBytes\n    }\n  }\n": types.MaterialListaFragmentDoc,
    "\n  query MaterialTutor($tutorId: ID!, $ramoCodigo: String!) {\n    material(tutorId: $tutorId, ramoCodigo: $ramoCodigo) {\n      ...MaterialLista\n    }\n  }\n": types.MaterialTutorDocument,
    "\n  mutation PublicarAviso($ramoCodigo: String!, $titulo: String!, $texto: String!) {\n    publicarAviso(ramoCodigo: $ramoCodigo, titulo: $titulo, texto: $texto) {\n      id\n    }\n  }\n": types.PublicarAvisoDocument,
    "\n  mutation EliminarMaterial($id: ID!) {\n    eliminarMaterial(id: $id)\n  }\n": types.EliminarMaterialDocument,
    "\n  mutation FinalizarSesion($id: ID!) {\n    finalizarSesion(id: $id) {\n      id\n      estado\n    }\n  }\n": types.FinalizarSesionDocument,
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
export function graphql(source: "\n  query Prueba {\n    ramos {\n      codigo\n    }\n  }\n"): (typeof documents)["\n  query Prueba {\n    ramos {\n      codigo\n    }\n  }\n"];
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
export function graphql(source: "\n  fragment TutorTarjeta on Usuario {\n    id\n    nombre\n    promedioEvaluaciones\n    cantidadEvaluaciones\n  }\n"): (typeof documents)["\n  fragment TutorTarjeta on Usuario {\n    id\n    nombre\n    promedioEvaluaciones\n    cantidadEvaluaciones\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query DisponibilidadRamo($ramoCodigo: String!, $desde: DateTime!, $hasta: DateTime!) {\n    buscarDisponibilidad(ramoCodigo: $ramoCodigo, desde: $desde, hasta: $hasta) {\n      id\n      inicio\n      ramoCodigo\n      tutorId\n      tutor {\n        ...TutorTarjeta\n      }\n    }\n  }\n"): (typeof documents)["\n  query DisponibilidadRamo($ramoCodigo: String!, $desde: DateTime!, $hasta: DateTime!) {\n    buscarDisponibilidad(ramoCodigo: $ramoCodigo, desde: $desde, hasta: $hasta) {\n      id\n      inicio\n      ramoCodigo\n      tutorId\n      tutor {\n        ...TutorTarjeta\n      }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query MisReservas($estudianteId: ID!, $desde: DateTime!, $hasta: DateTime!) {\n    sesiones(estudianteId: $estudianteId, desde: $desde, hasta: $hasta) {\n      id\n      inicio\n      estado\n      ramoCodigo\n      tutorId\n      tutor {\n        ...TutorTarjeta\n      }\n    }\n  }\n"): (typeof documents)["\n  query MisReservas($estudianteId: ID!, $desde: DateTime!, $hasta: DateTime!) {\n    sesiones(estudianteId: $estudianteId, desde: $desde, hasta: $hasta) {\n      id\n      inicio\n      estado\n      ramoCodigo\n      tutorId\n      tutor {\n        ...TutorTarjeta\n      }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query MisTutorias($estudianteId: ID!, $desde: DateTime!) {\n    sesiones(estudianteId: $estudianteId, desde: $desde) {\n      id\n      inicio\n      estado\n      ramoCodigo\n      tutorId\n      tutor {\n        ...TutorTarjeta\n      }\n    }\n  }\n"): (typeof documents)["\n  query MisTutorias($estudianteId: ID!, $desde: DateTime!) {\n    sesiones(estudianteId: $estudianteId, desde: $desde) {\n      id\n      inicio\n      estado\n      ramoCodigo\n      tutorId\n      tutor {\n        ...TutorTarjeta\n      }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query MaterialVisible {\n    material {\n      ...MaterialLista\n    }\n  }\n"): (typeof documents)["\n  query MaterialVisible {\n    material {\n      ...MaterialLista\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query ResenasAlumno($estudianteId: ID!) {\n    sesiones(estudianteId: $estudianteId, estado: FINALIZADA) {\n      id\n      inicio\n      ramoCodigo\n      tutorId\n      tutor {\n        ...TutorTarjeta\n      }\n    }\n    misEvaluaciones {\n      sesionId\n      nota\n      comentario\n      creadaEn\n    }\n  }\n"): (typeof documents)["\n  query ResenasAlumno($estudianteId: ID!) {\n    sesiones(estudianteId: $estudianteId, estado: FINALIZADA) {\n      id\n      inicio\n      ramoCodigo\n      tutorId\n      tutor {\n        ...TutorTarjeta\n      }\n    }\n    misEvaluaciones {\n      sesionId\n      nota\n      comentario\n      creadaEn\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation Evaluar($sesionId: ID!, $nota: Int!, $comentario: String) {\n    evaluar(sesionId: $sesionId, nota: $nota, comentario: $comentario) {\n      sesionId\n      nota\n      comentario\n      creadaEn\n    }\n  }\n"): (typeof documents)["\n  mutation Evaluar($sesionId: ID!, $nota: Int!, $comentario: String) {\n    evaluar(sesionId: $sesionId, nota: $nota, comentario: $comentario) {\n      sesionId\n      nota\n      comentario\n      creadaEn\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query PerfilAlumno {\n    yo {\n      ...UsuarioSesion\n    }\n  }\n"): (typeof documents)["\n  query PerfilAlumno {\n    yo {\n      ...UsuarioSesion\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation ChatAgente($mensaje: String!, $conversacionId: String) {\n    chatAgente(mensaje: $mensaje, conversacionId: $conversacionId) {\n      respuesta\n      conversacionId\n      acciones {\n        id\n        tipo\n      }\n    }\n  }\n"): (typeof documents)["\n  mutation ChatAgente($mensaje: String!, $conversacionId: String) {\n    chatAgente(mensaje: $mensaje, conversacionId: $conversacionId) {\n      respuesta\n      conversacionId\n      acciones {\n        id\n        tipo\n      }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation CrearSesion($input: CrearSesionInput!) {\n    crearSesion(input: $input) {\n      id\n      estado\n    }\n  }\n"): (typeof documents)["\n  mutation CrearSesion($input: CrearSesionInput!) {\n    crearSesion(input: $input) {\n      id\n      estado\n    }\n  }\n"];
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
export function graphql(source: "\n  query EvaluacionesTutor($tutorId: ID!) {\n    evaluacionesTutor(tutorId: $tutorId) {\n      promedio\n      cantidad\n      evaluaciones {\n        nota\n        comentario\n        creadaEn\n        ramoCodigo\n      }\n    }\n  }\n"): (typeof documents)["\n  query EvaluacionesTutor($tutorId: ID!) {\n    evaluacionesTutor(tutorId: $tutorId) {\n      promedio\n      cantidad\n      evaluaciones {\n        nota\n        comentario\n        creadaEn\n        ramoCodigo\n      }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  fragment RamosPerfil on Usuario {\n    ...UsuarioSesion\n    ramos {\n      activo\n      ramo {\n        codigo\n        nombre\n      }\n    }\n  }\n"): (typeof documents)["\n  fragment RamosPerfil on Usuario {\n    ...UsuarioSesion\n    ramos {\n      activo\n      ramo {\n        codigo\n        nombre\n      }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query PerfilTutor {\n    yo {\n      ...RamosPerfil\n      promedioEvaluaciones\n      cantidadEvaluaciones\n    }\n    ramos {\n      codigo\n      nombre\n    }\n  }\n"): (typeof documents)["\n  query PerfilTutor {\n    yo {\n      ...RamosPerfil\n      promedioEvaluaciones\n      cantidadEvaluaciones\n    }\n    ramos {\n      codigo\n      nombre\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation QuitarRamo($ramoCodigo: String!) {\n    quitarRamoTutor(ramoCodigo: $ramoCodigo) {\n      ...RamosPerfil\n    }\n  }\n"): (typeof documents)["\n  mutation QuitarRamo($ramoCodigo: String!) {\n    quitarRamoTutor(ramoCodigo: $ramoCodigo) {\n      ...RamosPerfil\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation ReactivarRamo($ramoCodigo: String!) {\n    reactivarRamoTutor(ramoCodigo: $ramoCodigo) {\n      ...RamosPerfil\n    }\n  }\n"): (typeof documents)["\n  mutation ReactivarRamo($ramoCodigo: String!) {\n    reactivarRamoTutor(ramoCodigo: $ramoCodigo) {\n      ...RamosPerfil\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  fragment MaterialLista on Material {\n    id\n    tipo\n    titulo\n    texto\n    creadoEn\n    ramoCodigo\n    tutorId\n    archivo {\n      nombre\n      tipoMime\n      tamanoBytes\n    }\n  }\n"): (typeof documents)["\n  fragment MaterialLista on Material {\n    id\n    tipo\n    titulo\n    texto\n    creadoEn\n    ramoCodigo\n    tutorId\n    archivo {\n      nombre\n      tipoMime\n      tamanoBytes\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query MaterialTutor($tutorId: ID!, $ramoCodigo: String!) {\n    material(tutorId: $tutorId, ramoCodigo: $ramoCodigo) {\n      ...MaterialLista\n    }\n  }\n"): (typeof documents)["\n  query MaterialTutor($tutorId: ID!, $ramoCodigo: String!) {\n    material(tutorId: $tutorId, ramoCodigo: $ramoCodigo) {\n      ...MaterialLista\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation PublicarAviso($ramoCodigo: String!, $titulo: String!, $texto: String!) {\n    publicarAviso(ramoCodigo: $ramoCodigo, titulo: $titulo, texto: $texto) {\n      id\n    }\n  }\n"): (typeof documents)["\n  mutation PublicarAviso($ramoCodigo: String!, $titulo: String!, $texto: String!) {\n    publicarAviso(ramoCodigo: $ramoCodigo, titulo: $titulo, texto: $texto) {\n      id\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation EliminarMaterial($id: ID!) {\n    eliminarMaterial(id: $id)\n  }\n"): (typeof documents)["\n  mutation EliminarMaterial($id: ID!) {\n    eliminarMaterial(id: $id)\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation FinalizarSesion($id: ID!) {\n    finalizarSesion(id: $id) {\n      id\n      estado\n    }\n  }\n"): (typeof documents)["\n  mutation FinalizarSesion($id: ID!) {\n    finalizarSesion(id: $id) {\n      id\n      estado\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation CancelarSesion($id: ID!) {\n    cancelarSesion(id: $id) {\n      id\n      estado\n    }\n  }\n"): (typeof documents)["\n  mutation CancelarSesion($id: ID!) {\n    cancelarSesion(id: $id) {\n      id\n      estado\n    }\n  }\n"];

export function graphql(source: string) {
  return (documents as any)[source] ?? {};
}

export type DocumentType<TDocumentNode extends DocumentNode<any, any>> = TDocumentNode extends DocumentNode<  infer TType,  any>  ? TType  : never;