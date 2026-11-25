/* eslint-disable */
import type { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';
/** Internal type. DO NOT USE DIRECTLY. */
type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
/** Internal type. DO NOT USE DIRECTLY. */
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
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

export type CancelarSesionMutationVariables = Exact<{
  id: string | number;
}>;


export type CancelarSesionMutation = { cancelarSesion: { id: string, estado: EstadoSesion } };

export const UsuarioSesionFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"UsuarioSesion"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Usuario"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"nombre"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"esTutor"}}]}}]} as unknown as DocumentNode<UsuarioSesionFragment, unknown>;
export const LoginDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"Login"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"LoginInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"login"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"token"}},{"kind":"Field","name":{"kind":"Name","value":"usuario"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"UsuarioSesion"}}]}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"UsuarioSesion"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Usuario"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"nombre"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"esTutor"}}]}}]} as unknown as DocumentNode<LoginMutation, LoginMutationVariables>;
export const RegistroDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"Registro"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"RegistroInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"registro"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"token"}},{"kind":"Field","name":{"kind":"Name","value":"usuario"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"UsuarioSesion"}}]}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"UsuarioSesion"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Usuario"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"nombre"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"esTutor"}}]}}]} as unknown as DocumentNode<RegistroMutation, RegistroMutationVariables>;
export const RamosDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"Ramos"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"ramos"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"codigo"}},{"kind":"Field","name":{"kind":"Name","value":"nombre"}}]}}]}}]} as unknown as DocumentNode<RamosQuery, RamosQueryVariables>;
export const AgregarRamosTutorDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"AgregarRamosTutor"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"ramos"}},"type":{"kind":"NonNullType","type":{"kind":"ListType","type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"InscripcionRamoInput"}}}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"agregarRamosTutor"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"ramos"},"value":{"kind":"Variable","name":{"kind":"Name","value":"ramos"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"UsuarioSesion"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"UsuarioSesion"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Usuario"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"nombre"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"esTutor"}}]}}]} as unknown as DocumentNode<AgregarRamosTutorMutation, AgregarRamosTutorMutationVariables>;
export const MisRamosDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"MisRamos"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"yo"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"ramos"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"activo"}},{"kind":"Field","name":{"kind":"Name","value":"ramo"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"codigo"}},{"kind":"Field","name":{"kind":"Name","value":"nombre"}}]}}]}}]}}]}}]} as unknown as DocumentNode<MisRamosQuery, MisRamosQueryVariables>;
export const SemanaTutorDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"SemanaTutor"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"tutorId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"desde"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"DateTime"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"hasta"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"DateTime"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"disponibilidad"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"tutorId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"tutorId"}}},{"kind":"Argument","name":{"kind":"Name","value":"desde"},"value":{"kind":"Variable","name":{"kind":"Name","value":"desde"}}},{"kind":"Argument","name":{"kind":"Name","value":"hasta"},"value":{"kind":"Variable","name":{"kind":"Name","value":"hasta"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"inicio"}},{"kind":"Field","name":{"kind":"Name","value":"ramoCodigo"}},{"kind":"Field","name":{"kind":"Name","value":"libre"}}]}},{"kind":"Field","name":{"kind":"Name","value":"sesiones"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"tutorId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"tutorId"}}},{"kind":"Argument","name":{"kind":"Name","value":"desde"},"value":{"kind":"Variable","name":{"kind":"Name","value":"desde"}}},{"kind":"Argument","name":{"kind":"Name","value":"hasta"},"value":{"kind":"Variable","name":{"kind":"Name","value":"hasta"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"inicio"}},{"kind":"Field","name":{"kind":"Name","value":"estado"}},{"kind":"Field","name":{"kind":"Name","value":"ramoCodigo"}},{"kind":"Field","name":{"kind":"Name","value":"estudianteId"}},{"kind":"Field","name":{"kind":"Name","value":"estudiante"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"nombre"}}]}}]}}]}}]} as unknown as DocumentNode<SemanaTutorQuery, SemanaTutorQueryVariables>;
export const PendientesDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"Pendientes"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"tutorId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"sesiones"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"tutorId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"tutorId"}}},{"kind":"Argument","name":{"kind":"Name","value":"estado"},"value":{"kind":"EnumValue","value":"PENDIENTE"}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"inicio"}},{"kind":"Field","name":{"kind":"Name","value":"estado"}},{"kind":"Field","name":{"kind":"Name","value":"ramoCodigo"}},{"kind":"Field","name":{"kind":"Name","value":"estudianteId"}},{"kind":"Field","name":{"kind":"Name","value":"estudiante"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"nombre"}}]}}]}}]}}]} as unknown as DocumentNode<PendientesQuery, PendientesQueryVariables>;
export const MarcarCasillaDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"MarcarCasilla"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"ramoCodigo"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"inicio"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"DateTime"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"marcarCasilla"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"ramoCodigo"},"value":{"kind":"Variable","name":{"kind":"Name","value":"ramoCodigo"}}},{"kind":"Argument","name":{"kind":"Name","value":"inicio"},"value":{"kind":"Variable","name":{"kind":"Name","value":"inicio"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}}]}}]} as unknown as DocumentNode<MarcarCasillaMutation, MarcarCasillaMutationVariables>;
export const DesmarcarCasillaDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"DesmarcarCasilla"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"desmarcarCasilla"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}]}]}}]} as unknown as DocumentNode<DesmarcarCasillaMutation, DesmarcarCasillaMutationVariables>;
export const ConfirmarSesionDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"ConfirmarSesion"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"confirmarSesion"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"estado"}}]}}]}}]} as unknown as DocumentNode<ConfirmarSesionMutation, ConfirmarSesionMutationVariables>;
export const CancelarSesionDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"CancelarSesion"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"cancelarSesion"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"estado"}}]}}]}}]} as unknown as DocumentNode<CancelarSesionMutation, CancelarSesionMutationVariables>;