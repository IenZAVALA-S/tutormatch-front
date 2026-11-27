/* eslint-disable */
import type { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';
/** Internal type. DO NOT USE DIRECTLY. */
type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
/** Internal type. DO NOT USE DIRECTLY. */
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
export type CrearSesionInput = {
  /** Inicio de una casilla libre del tutor, en UTC */
  inicio: string;
  ramoCodigo: string;
  tutorId: string | number;
};

export type EstadoSesion =
  | 'CANCELADA'
  | 'CONFIRMADA'
  | 'FINALIZADA'
  | 'PENDIENTE';

/** Datos del formulario de verificación para un ramo */
export type InscripcionRamoInput = {
  /** Escala chilena, de 4.0 a 7.0 */
  notaAprobacion: number;
  /** Año y semestre, ej. "2025-2" */
  periodoAprobacion: string;
  ramoCodigo: string;
};

export type LoginInput = {
  email: string;
  password: string;
};

export type RegistroInput = {
  email: string;
  nombre: string;
  password: string;
};

export type TipoMaterial =
  | 'ARCHIVO'
  | 'AVISO';

export type UsuarioSesionFragment = { id: string, nombre: string, email: string, esTutor: boolean };

export type LoginMutationVariables = Exact<{
  input: LoginInput;
}>;


export type LoginMutation = { login: { token: string, usuario: { id: string, nombre: string, email: string, esTutor: boolean } } };

export type RegistroMutationVariables = Exact<{
  input: RegistroInput;
}>;


export type RegistroMutation = { registro: { token: string, usuario: { id: string, nombre: string, email: string, esTutor: boolean } } };

export type RamosQueryVariables = Exact<{ [key: string]: never; }>;


export type RamosQuery = { ramos: Array<{ codigo: string, nombre: string }> };

export type AgregarRamosTutorMutationVariables = Exact<{
  ramos: Array<InscripcionRamoInput> | InscripcionRamoInput;
}>;


export type AgregarRamosTutorMutation = { agregarRamosTutor: { id: string, nombre: string, email: string, esTutor: boolean } };

export type TutorTarjetaFragment = { id: string, nombre: string, promedioEvaluaciones: number, cantidadEvaluaciones: number };

export type DisponibilidadRamoQueryVariables = Exact<{
  ramoCodigo: string;
  desde: string;
  hasta: string;
}>;


export type DisponibilidadRamoQuery = { buscarDisponibilidad: Array<{ id: string, inicio: string, ramoCodigo: string, tutorId: string, tutor: { id: string, nombre: string, promedioEvaluaciones: number, cantidadEvaluaciones: number } | null }> };

export type MisReservasQueryVariables = Exact<{
  estudianteId: string | number;
  desde: string;
  hasta: string;
}>;


export type MisReservasQuery = { sesiones: Array<{ id: string, inicio: string, estado: EstadoSesion, ramoCodigo: string, tutorId: string, tutor: { id: string, nombre: string, promedioEvaluaciones: number, cantidadEvaluaciones: number } | null }> };

export type MisTutoriasQueryVariables = Exact<{
  estudianteId: string | number;
  desde: string;
}>;


export type MisTutoriasQuery = { sesiones: Array<{ id: string, inicio: string, estado: EstadoSesion, ramoCodigo: string, tutorId: string, tutor: { id: string, nombre: string, promedioEvaluaciones: number, cantidadEvaluaciones: number } | null }> };

export type MaterialVisibleQueryVariables = Exact<{ [key: string]: never; }>;


export type MaterialVisibleQuery = { material: Array<{ id: string, tipo: TipoMaterial, titulo: string, texto: string | null, creadoEn: string, ramoCodigo: string, tutorId: string, archivo: { nombre: string, tipoMime: string, tamanoBytes: number } | null }> };

export type ResenasAlumnoQueryVariables = Exact<{
  estudianteId: string | number;
}>;


export type ResenasAlumnoQuery = { sesiones: Array<{ id: string, inicio: string, ramoCodigo: string, tutorId: string, tutor: { id: string, nombre: string, promedioEvaluaciones: number, cantidadEvaluaciones: number } | null }>, misEvaluaciones: Array<{ sesionId: string, nota: number, comentario: string, creadaEn: string }> };

export type EvaluarMutationVariables = Exact<{
  sesionId: string | number;
  nota: number;
  comentario?: string | null | undefined;
}>;


export type EvaluarMutation = { evaluar: { sesionId: string, nota: number, comentario: string, creadaEn: string } };

export type PerfilAlumnoQueryVariables = Exact<{ [key: string]: never; }>;


export type PerfilAlumnoQuery = { yo: { id: string, nombre: string, email: string, esTutor: boolean } };

export type CrearSesionMutationVariables = Exact<{
  input: CrearSesionInput;
}>;


export type CrearSesionMutation = { crearSesion: { id: string, estado: EstadoSesion } };

export type MisRamosQueryVariables = Exact<{ [key: string]: never; }>;


export type MisRamosQuery = { yo: { id: string, ramos: Array<{ activo: boolean, ramo: { codigo: string, nombre: string } }> } };

export type SemanaTutorQueryVariables = Exact<{
  tutorId: string | number;
  desde: string;
  hasta: string;
}>;


export type SemanaTutorQuery = { disponibilidad: Array<{ id: string, inicio: string, ramoCodigo: string, libre: boolean }>, sesiones: Array<{ id: string, inicio: string, estado: EstadoSesion, ramoCodigo: string, estudianteId: string, estudiante: { id: string, nombre: string } | null }> };

export type PendientesQueryVariables = Exact<{
  tutorId: string | number;
}>;


export type PendientesQuery = { sesiones: Array<{ id: string, inicio: string, estado: EstadoSesion, ramoCodigo: string, estudianteId: string, estudiante: { id: string, nombre: string } | null }> };

export type MarcarCasillaMutationVariables = Exact<{
  ramoCodigo: string;
  inicio: string;
}>;


export type MarcarCasillaMutation = { marcarCasilla: { id: string } };

export type DesmarcarCasillaMutationVariables = Exact<{
  id: string | number;
}>;


export type DesmarcarCasillaMutation = { desmarcarCasilla: boolean };

export type ConfirmarSesionMutationVariables = Exact<{
  id: string | number;
}>;


export type ConfirmarSesionMutation = { confirmarSesion: { id: string, estado: EstadoSesion } };

export type EvaluacionesTutorQueryVariables = Exact<{
  tutorId: string | number;
}>;


export type EvaluacionesTutorQuery = { evaluacionesTutor: { promedio: number, cantidad: number, evaluaciones: Array<{ nota: number, comentario: string, creadaEn: string, ramoCodigo: string }> } };

export type RamosPerfilFragment = { id: string, nombre: string, email: string, esTutor: boolean, ramos: Array<{ activo: boolean, ramo: { codigo: string, nombre: string } }> };

export type PerfilTutorQueryVariables = Exact<{ [key: string]: never; }>;


export type PerfilTutorQuery = { yo: { promedioEvaluaciones: number, cantidadEvaluaciones: number, id: string, nombre: string, email: string, esTutor: boolean, ramos: Array<{ activo: boolean, ramo: { codigo: string, nombre: string } }> }, ramos: Array<{ codigo: string, nombre: string }> };

export type QuitarRamoMutationVariables = Exact<{
  ramoCodigo: string;
}>;


export type QuitarRamoMutation = { quitarRamoTutor: { id: string, nombre: string, email: string, esTutor: boolean, ramos: Array<{ activo: boolean, ramo: { codigo: string, nombre: string } }> } };

export type ReactivarRamoMutationVariables = Exact<{
  ramoCodigo: string;
}>;


export type ReactivarRamoMutation = { reactivarRamoTutor: { id: string, nombre: string, email: string, esTutor: boolean, ramos: Array<{ activo: boolean, ramo: { codigo: string, nombre: string } }> } };

export type MaterialListaFragment = { id: string, tipo: TipoMaterial, titulo: string, texto: string | null, creadoEn: string, ramoCodigo: string, tutorId: string, archivo: { nombre: string, tipoMime: string, tamanoBytes: number } | null };

export type MaterialTutorQueryVariables = Exact<{
  tutorId: string | number;
  ramoCodigo: string;
}>;


export type MaterialTutorQuery = { material: Array<{ id: string, tipo: TipoMaterial, titulo: string, texto: string | null, creadoEn: string, ramoCodigo: string, tutorId: string, archivo: { nombre: string, tipoMime: string, tamanoBytes: number } | null }> };

export type PublicarAvisoMutationVariables = Exact<{
  ramoCodigo: string;
  titulo: string;
  texto: string;
}>;


export type PublicarAvisoMutation = { publicarAviso: { id: string } };

export type EliminarMaterialMutationVariables = Exact<{
  id: string | number;
}>;


export type EliminarMaterialMutation = { eliminarMaterial: boolean };

export type CancelarSesionMutationVariables = Exact<{
  id: string | number;
}>;


export type CancelarSesionMutation = { cancelarSesion: { id: string, estado: EstadoSesion } };

export const TutorTarjetaFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"TutorTarjeta"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Usuario"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"nombre"}},{"kind":"Field","name":{"kind":"Name","value":"promedioEvaluaciones"}},{"kind":"Field","name":{"kind":"Name","value":"cantidadEvaluaciones"}}]}}]} as unknown as DocumentNode<TutorTarjetaFragment, unknown>;
export const UsuarioSesionFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"UsuarioSesion"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Usuario"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"nombre"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"esTutor"}}]}}]} as unknown as DocumentNode<UsuarioSesionFragment, unknown>;
export const RamosPerfilFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"RamosPerfil"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Usuario"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"UsuarioSesion"}},{"kind":"Field","name":{"kind":"Name","value":"ramos"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"activo"}},{"kind":"Field","name":{"kind":"Name","value":"ramo"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"codigo"}},{"kind":"Field","name":{"kind":"Name","value":"nombre"}}]}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"UsuarioSesion"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Usuario"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"nombre"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"esTutor"}}]}}]} as unknown as DocumentNode<RamosPerfilFragment, unknown>;
export const MaterialListaFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"MaterialLista"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Material"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"tipo"}},{"kind":"Field","name":{"kind":"Name","value":"titulo"}},{"kind":"Field","name":{"kind":"Name","value":"texto"}},{"kind":"Field","name":{"kind":"Name","value":"creadoEn"}},{"kind":"Field","name":{"kind":"Name","value":"ramoCodigo"}},{"kind":"Field","name":{"kind":"Name","value":"tutorId"}},{"kind":"Field","name":{"kind":"Name","value":"archivo"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"nombre"}},{"kind":"Field","name":{"kind":"Name","value":"tipoMime"}},{"kind":"Field","name":{"kind":"Name","value":"tamanoBytes"}}]}}]}}]} as unknown as DocumentNode<MaterialListaFragment, unknown>;
export const LoginDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"Login"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"LoginInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"login"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"token"}},{"kind":"Field","name":{"kind":"Name","value":"usuario"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"UsuarioSesion"}}]}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"UsuarioSesion"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Usuario"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"nombre"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"esTutor"}}]}}]} as unknown as DocumentNode<LoginMutation, LoginMutationVariables>;
export const RegistroDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"Registro"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"RegistroInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"registro"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"token"}},{"kind":"Field","name":{"kind":"Name","value":"usuario"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"UsuarioSesion"}}]}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"UsuarioSesion"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Usuario"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"nombre"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"esTutor"}}]}}]} as unknown as DocumentNode<RegistroMutation, RegistroMutationVariables>;
export const RamosDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"Ramos"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"ramos"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"codigo"}},{"kind":"Field","name":{"kind":"Name","value":"nombre"}}]}}]}}]} as unknown as DocumentNode<RamosQuery, RamosQueryVariables>;
export const AgregarRamosTutorDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"AgregarRamosTutor"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"ramos"}},"type":{"kind":"NonNullType","type":{"kind":"ListType","type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"InscripcionRamoInput"}}}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"agregarRamosTutor"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"ramos"},"value":{"kind":"Variable","name":{"kind":"Name","value":"ramos"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"UsuarioSesion"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"UsuarioSesion"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Usuario"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"nombre"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"esTutor"}}]}}]} as unknown as DocumentNode<AgregarRamosTutorMutation, AgregarRamosTutorMutationVariables>;
export const DisponibilidadRamoDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"DisponibilidadRamo"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"ramoCodigo"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"desde"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"DateTime"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"hasta"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"DateTime"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"buscarDisponibilidad"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"ramoCodigo"},"value":{"kind":"Variable","name":{"kind":"Name","value":"ramoCodigo"}}},{"kind":"Argument","name":{"kind":"Name","value":"desde"},"value":{"kind":"Variable","name":{"kind":"Name","value":"desde"}}},{"kind":"Argument","name":{"kind":"Name","value":"hasta"},"value":{"kind":"Variable","name":{"kind":"Name","value":"hasta"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"inicio"}},{"kind":"Field","name":{"kind":"Name","value":"ramoCodigo"}},{"kind":"Field","name":{"kind":"Name","value":"tutorId"}},{"kind":"Field","name":{"kind":"Name","value":"tutor"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"TutorTarjeta"}}]}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"TutorTarjeta"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Usuario"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"nombre"}},{"kind":"Field","name":{"kind":"Name","value":"promedioEvaluaciones"}},{"kind":"Field","name":{"kind":"Name","value":"cantidadEvaluaciones"}}]}}]} as unknown as DocumentNode<DisponibilidadRamoQuery, DisponibilidadRamoQueryVariables>;
export const MisReservasDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"MisReservas"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"estudianteId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"desde"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"DateTime"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"hasta"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"DateTime"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"sesiones"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"estudianteId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"estudianteId"}}},{"kind":"Argument","name":{"kind":"Name","value":"desde"},"value":{"kind":"Variable","name":{"kind":"Name","value":"desde"}}},{"kind":"Argument","name":{"kind":"Name","value":"hasta"},"value":{"kind":"Variable","name":{"kind":"Name","value":"hasta"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"inicio"}},{"kind":"Field","name":{"kind":"Name","value":"estado"}},{"kind":"Field","name":{"kind":"Name","value":"ramoCodigo"}},{"kind":"Field","name":{"kind":"Name","value":"tutorId"}},{"kind":"Field","name":{"kind":"Name","value":"tutor"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"TutorTarjeta"}}]}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"TutorTarjeta"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Usuario"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"nombre"}},{"kind":"Field","name":{"kind":"Name","value":"promedioEvaluaciones"}},{"kind":"Field","name":{"kind":"Name","value":"cantidadEvaluaciones"}}]}}]} as unknown as DocumentNode<MisReservasQuery, MisReservasQueryVariables>;
export const MisTutoriasDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"MisTutorias"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"estudianteId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"desde"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"DateTime"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"sesiones"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"estudianteId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"estudianteId"}}},{"kind":"Argument","name":{"kind":"Name","value":"desde"},"value":{"kind":"Variable","name":{"kind":"Name","value":"desde"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"inicio"}},{"kind":"Field","name":{"kind":"Name","value":"estado"}},{"kind":"Field","name":{"kind":"Name","value":"ramoCodigo"}},{"kind":"Field","name":{"kind":"Name","value":"tutorId"}},{"kind":"Field","name":{"kind":"Name","value":"tutor"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"TutorTarjeta"}}]}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"TutorTarjeta"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Usuario"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"nombre"}},{"kind":"Field","name":{"kind":"Name","value":"promedioEvaluaciones"}},{"kind":"Field","name":{"kind":"Name","value":"cantidadEvaluaciones"}}]}}]} as unknown as DocumentNode<MisTutoriasQuery, MisTutoriasQueryVariables>;
export const MaterialVisibleDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"MaterialVisible"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"material"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"MaterialLista"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"MaterialLista"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Material"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"tipo"}},{"kind":"Field","name":{"kind":"Name","value":"titulo"}},{"kind":"Field","name":{"kind":"Name","value":"texto"}},{"kind":"Field","name":{"kind":"Name","value":"creadoEn"}},{"kind":"Field","name":{"kind":"Name","value":"ramoCodigo"}},{"kind":"Field","name":{"kind":"Name","value":"tutorId"}},{"kind":"Field","name":{"kind":"Name","value":"archivo"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"nombre"}},{"kind":"Field","name":{"kind":"Name","value":"tipoMime"}},{"kind":"Field","name":{"kind":"Name","value":"tamanoBytes"}}]}}]}}]} as unknown as DocumentNode<MaterialVisibleQuery, MaterialVisibleQueryVariables>;
export const ResenasAlumnoDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"ResenasAlumno"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"estudianteId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"sesiones"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"estudianteId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"estudianteId"}}},{"kind":"Argument","name":{"kind":"Name","value":"estado"},"value":{"kind":"EnumValue","value":"FINALIZADA"}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"inicio"}},{"kind":"Field","name":{"kind":"Name","value":"ramoCodigo"}},{"kind":"Field","name":{"kind":"Name","value":"tutorId"}},{"kind":"Field","name":{"kind":"Name","value":"tutor"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"TutorTarjeta"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"misEvaluaciones"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"sesionId"}},{"kind":"Field","name":{"kind":"Name","value":"nota"}},{"kind":"Field","name":{"kind":"Name","value":"comentario"}},{"kind":"Field","name":{"kind":"Name","value":"creadaEn"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"TutorTarjeta"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Usuario"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"nombre"}},{"kind":"Field","name":{"kind":"Name","value":"promedioEvaluaciones"}},{"kind":"Field","name":{"kind":"Name","value":"cantidadEvaluaciones"}}]}}]} as unknown as DocumentNode<ResenasAlumnoQuery, ResenasAlumnoQueryVariables>;
export const EvaluarDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"Evaluar"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"sesionId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"nota"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"comentario"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"evaluar"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"sesionId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"sesionId"}}},{"kind":"Argument","name":{"kind":"Name","value":"nota"},"value":{"kind":"Variable","name":{"kind":"Name","value":"nota"}}},{"kind":"Argument","name":{"kind":"Name","value":"comentario"},"value":{"kind":"Variable","name":{"kind":"Name","value":"comentario"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"sesionId"}},{"kind":"Field","name":{"kind":"Name","value":"nota"}},{"kind":"Field","name":{"kind":"Name","value":"comentario"}},{"kind":"Field","name":{"kind":"Name","value":"creadaEn"}}]}}]}}]} as unknown as DocumentNode<EvaluarMutation, EvaluarMutationVariables>;
export const PerfilAlumnoDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"PerfilAlumno"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"yo"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"UsuarioSesion"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"UsuarioSesion"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Usuario"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"nombre"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"esTutor"}}]}}]} as unknown as DocumentNode<PerfilAlumnoQuery, PerfilAlumnoQueryVariables>;
export const CrearSesionDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"CrearSesion"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"CrearSesionInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"crearSesion"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"estado"}}]}}]}}]} as unknown as DocumentNode<CrearSesionMutation, CrearSesionMutationVariables>;
export const MisRamosDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"MisRamos"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"yo"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"ramos"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"activo"}},{"kind":"Field","name":{"kind":"Name","value":"ramo"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"codigo"}},{"kind":"Field","name":{"kind":"Name","value":"nombre"}}]}}]}}]}}]}}]} as unknown as DocumentNode<MisRamosQuery, MisRamosQueryVariables>;
export const SemanaTutorDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"SemanaTutor"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"tutorId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"desde"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"DateTime"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"hasta"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"DateTime"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"disponibilidad"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"tutorId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"tutorId"}}},{"kind":"Argument","name":{"kind":"Name","value":"desde"},"value":{"kind":"Variable","name":{"kind":"Name","value":"desde"}}},{"kind":"Argument","name":{"kind":"Name","value":"hasta"},"value":{"kind":"Variable","name":{"kind":"Name","value":"hasta"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"inicio"}},{"kind":"Field","name":{"kind":"Name","value":"ramoCodigo"}},{"kind":"Field","name":{"kind":"Name","value":"libre"}}]}},{"kind":"Field","name":{"kind":"Name","value":"sesiones"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"tutorId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"tutorId"}}},{"kind":"Argument","name":{"kind":"Name","value":"desde"},"value":{"kind":"Variable","name":{"kind":"Name","value":"desde"}}},{"kind":"Argument","name":{"kind":"Name","value":"hasta"},"value":{"kind":"Variable","name":{"kind":"Name","value":"hasta"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"inicio"}},{"kind":"Field","name":{"kind":"Name","value":"estado"}},{"kind":"Field","name":{"kind":"Name","value":"ramoCodigo"}},{"kind":"Field","name":{"kind":"Name","value":"estudianteId"}},{"kind":"Field","name":{"kind":"Name","value":"estudiante"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"nombre"}}]}}]}}]}}]} as unknown as DocumentNode<SemanaTutorQuery, SemanaTutorQueryVariables>;
export const PendientesDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"Pendientes"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"tutorId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"sesiones"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"tutorId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"tutorId"}}},{"kind":"Argument","name":{"kind":"Name","value":"estado"},"value":{"kind":"EnumValue","value":"PENDIENTE"}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"inicio"}},{"kind":"Field","name":{"kind":"Name","value":"estado"}},{"kind":"Field","name":{"kind":"Name","value":"ramoCodigo"}},{"kind":"Field","name":{"kind":"Name","value":"estudianteId"}},{"kind":"Field","name":{"kind":"Name","value":"estudiante"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"nombre"}}]}}]}}]}}]} as unknown as DocumentNode<PendientesQuery, PendientesQueryVariables>;
export const MarcarCasillaDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"MarcarCasilla"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"ramoCodigo"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"inicio"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"DateTime"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"marcarCasilla"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"ramoCodigo"},"value":{"kind":"Variable","name":{"kind":"Name","value":"ramoCodigo"}}},{"kind":"Argument","name":{"kind":"Name","value":"inicio"},"value":{"kind":"Variable","name":{"kind":"Name","value":"inicio"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}}]}}]} as unknown as DocumentNode<MarcarCasillaMutation, MarcarCasillaMutationVariables>;
export const DesmarcarCasillaDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"DesmarcarCasilla"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"desmarcarCasilla"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}]}]}}]} as unknown as DocumentNode<DesmarcarCasillaMutation, DesmarcarCasillaMutationVariables>;
export const ConfirmarSesionDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"ConfirmarSesion"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"confirmarSesion"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"estado"}}]}}]}}]} as unknown as DocumentNode<ConfirmarSesionMutation, ConfirmarSesionMutationVariables>;
export const EvaluacionesTutorDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"EvaluacionesTutor"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"tutorId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"evaluacionesTutor"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"tutorId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"tutorId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"promedio"}},{"kind":"Field","name":{"kind":"Name","value":"cantidad"}},{"kind":"Field","name":{"kind":"Name","value":"evaluaciones"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"nota"}},{"kind":"Field","name":{"kind":"Name","value":"comentario"}},{"kind":"Field","name":{"kind":"Name","value":"creadaEn"}},{"kind":"Field","name":{"kind":"Name","value":"ramoCodigo"}}]}}]}}]}}]} as unknown as DocumentNode<EvaluacionesTutorQuery, EvaluacionesTutorQueryVariables>;
export const PerfilTutorDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"PerfilTutor"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"yo"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"RamosPerfil"}},{"kind":"Field","name":{"kind":"Name","value":"promedioEvaluaciones"}},{"kind":"Field","name":{"kind":"Name","value":"cantidadEvaluaciones"}}]}},{"kind":"Field","name":{"kind":"Name","value":"ramos"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"codigo"}},{"kind":"Field","name":{"kind":"Name","value":"nombre"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"UsuarioSesion"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Usuario"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"nombre"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"esTutor"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"RamosPerfil"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Usuario"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"UsuarioSesion"}},{"kind":"Field","name":{"kind":"Name","value":"ramos"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"activo"}},{"kind":"Field","name":{"kind":"Name","value":"ramo"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"codigo"}},{"kind":"Field","name":{"kind":"Name","value":"nombre"}}]}}]}}]}}]} as unknown as DocumentNode<PerfilTutorQuery, PerfilTutorQueryVariables>;
export const QuitarRamoDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"QuitarRamo"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"ramoCodigo"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"quitarRamoTutor"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"ramoCodigo"},"value":{"kind":"Variable","name":{"kind":"Name","value":"ramoCodigo"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"RamosPerfil"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"UsuarioSesion"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Usuario"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"nombre"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"esTutor"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"RamosPerfil"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Usuario"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"UsuarioSesion"}},{"kind":"Field","name":{"kind":"Name","value":"ramos"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"activo"}},{"kind":"Field","name":{"kind":"Name","value":"ramo"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"codigo"}},{"kind":"Field","name":{"kind":"Name","value":"nombre"}}]}}]}}]}}]} as unknown as DocumentNode<QuitarRamoMutation, QuitarRamoMutationVariables>;
export const ReactivarRamoDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"ReactivarRamo"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"ramoCodigo"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"reactivarRamoTutor"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"ramoCodigo"},"value":{"kind":"Variable","name":{"kind":"Name","value":"ramoCodigo"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"RamosPerfil"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"UsuarioSesion"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Usuario"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"nombre"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"esTutor"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"RamosPerfil"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Usuario"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"UsuarioSesion"}},{"kind":"Field","name":{"kind":"Name","value":"ramos"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"activo"}},{"kind":"Field","name":{"kind":"Name","value":"ramo"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"codigo"}},{"kind":"Field","name":{"kind":"Name","value":"nombre"}}]}}]}}]}}]} as unknown as DocumentNode<ReactivarRamoMutation, ReactivarRamoMutationVariables>;
export const MaterialTutorDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"MaterialTutor"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"tutorId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"ramoCodigo"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"material"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"tutorId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"tutorId"}}},{"kind":"Argument","name":{"kind":"Name","value":"ramoCodigo"},"value":{"kind":"Variable","name":{"kind":"Name","value":"ramoCodigo"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"MaterialLista"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"MaterialLista"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Material"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"tipo"}},{"kind":"Field","name":{"kind":"Name","value":"titulo"}},{"kind":"Field","name":{"kind":"Name","value":"texto"}},{"kind":"Field","name":{"kind":"Name","value":"creadoEn"}},{"kind":"Field","name":{"kind":"Name","value":"ramoCodigo"}},{"kind":"Field","name":{"kind":"Name","value":"tutorId"}},{"kind":"Field","name":{"kind":"Name","value":"archivo"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"nombre"}},{"kind":"Field","name":{"kind":"Name","value":"tipoMime"}},{"kind":"Field","name":{"kind":"Name","value":"tamanoBytes"}}]}}]}}]} as unknown as DocumentNode<MaterialTutorQuery, MaterialTutorQueryVariables>;
export const PublicarAvisoDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"PublicarAviso"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"ramoCodigo"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"titulo"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"texto"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"publicarAviso"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"ramoCodigo"},"value":{"kind":"Variable","name":{"kind":"Name","value":"ramoCodigo"}}},{"kind":"Argument","name":{"kind":"Name","value":"titulo"},"value":{"kind":"Variable","name":{"kind":"Name","value":"titulo"}}},{"kind":"Argument","name":{"kind":"Name","value":"texto"},"value":{"kind":"Variable","name":{"kind":"Name","value":"texto"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}}]}}]} as unknown as DocumentNode<PublicarAvisoMutation, PublicarAvisoMutationVariables>;
export const EliminarMaterialDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"EliminarMaterial"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"eliminarMaterial"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}]}]}}]} as unknown as DocumentNode<EliminarMaterialMutation, EliminarMaterialMutationVariables>;
export const CancelarSesionDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"CancelarSesion"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"cancelarSesion"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"estado"}}]}}]}}]} as unknown as DocumentNode<CancelarSesionMutation, CancelarSesionMutationVariables>;