/** Internal type. DO NOT USE DIRECTLY. */
type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
/** Internal type. DO NOT USE DIRECTLY. */
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
import type * as Types from '../generated/types';

import type { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';
export type HentNavnQueryVariables = Exact<{
  ident: string;
}>;


export type HentNavnQuery = { hentPersonopplysninger: { navn: { fornavn: string, mellomnavn: string | null, etternavn: string } } };


export const HentNavnDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"hentNavn"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"ident"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"hentPersonopplysninger"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"ident"},"value":{"kind":"Variable","name":{"kind":"Name","value":"ident"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"navn"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"fornavn"}},{"kind":"Field","name":{"kind":"Name","value":"mellomnavn"}},{"kind":"Field","name":{"kind":"Name","value":"etternavn"}}]}}]}}]}}]} as unknown as DocumentNode<HentNavnQuery, HentNavnQueryVariables>;