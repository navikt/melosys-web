/** Internal type. DO NOT USE DIRECTLY. */
type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
/** Internal type. DO NOT USE DIRECTLY. */
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
import type * as Types from '../../../../../graphql/generated/types';

import type { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';
export type Familierelasjonsrolle =
  | 'BARN'
  | 'FAR'
  | 'MOR'
  | 'RELATERT_VED_SIVILSTAND';

export type HentFamiliemedlemmerQueryVariables = Exact<{
  behandlingID: number;
}>;


export type HentFamiliemedlemmerQuery = { hentSaksopplysninger: { persondata: { familiemedlemmer: Array<{ navn: string, ident: string, relasjonsrolle: Types.Familierelasjonsrolle, alder: number | null, foreldreansvar: string | null, fnrAnnenForelder: string | null, sivilstand: { type: string, gyldigFraOgMed: string | null, erHistorisk: boolean, master: string } | null }> } } };


export const HentFamiliemedlemmerDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"hentFamiliemedlemmer"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"behandlingID"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Long"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"hentSaksopplysninger"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"behandlingID"},"value":{"kind":"Variable","name":{"kind":"Name","value":"behandlingID"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"persondata"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"familiemedlemmer"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"navn"}},{"kind":"Field","name":{"kind":"Name","value":"ident"}},{"kind":"Field","name":{"kind":"Name","value":"relasjonsrolle"}},{"kind":"Field","name":{"kind":"Name","value":"alder"}},{"kind":"Field","name":{"kind":"Name","value":"foreldreansvar"}},{"kind":"Field","name":{"kind":"Name","value":"fnrAnnenForelder"}},{"kind":"Field","name":{"kind":"Name","value":"sivilstand"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"gyldigFraOgMed"}},{"kind":"Field","name":{"kind":"Name","value":"erHistorisk"}},{"kind":"Field","name":{"kind":"Name","value":"master"}}]}}]}}]}}]}}]}}]} as unknown as DocumentNode<HentFamiliemedlemmerQuery, HentFamiliemedlemmerQueryVariables>;