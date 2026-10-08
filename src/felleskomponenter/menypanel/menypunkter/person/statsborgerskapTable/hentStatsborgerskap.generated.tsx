/** Internal type. DO NOT USE DIRECTLY. */
type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
/** Internal type. DO NOT USE DIRECTLY. */
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
import type * as Types from '../../../../../graphql/generated/types';

import type { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';
export type HentStatsborgerskapQueryVariables = Exact<{
  behandlingID: number;
}>;


export type HentStatsborgerskapQuery = { hentSaksopplysninger: { persondata: { statsborgerskap: Array<{ land: string, bekreftelsesdato: string | null, gyldigFraOgMed: string | null, gyldigTilOgMed: string | null, master: string, kilde: string | null, erHistorisk: boolean }> } } };


export const HentStatsborgerskapDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"hentStatsborgerskap"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"behandlingID"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Long"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"hentSaksopplysninger"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"behandlingID"},"value":{"kind":"Variable","name":{"kind":"Name","value":"behandlingID"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"persondata"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"statsborgerskap"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"land"}},{"kind":"Field","name":{"kind":"Name","value":"bekreftelsesdato"}},{"kind":"Field","name":{"kind":"Name","value":"gyldigFraOgMed"}},{"kind":"Field","name":{"kind":"Name","value":"gyldigTilOgMed"}},{"kind":"Field","name":{"kind":"Name","value":"master"}},{"kind":"Field","name":{"kind":"Name","value":"kilde"}},{"kind":"Field","name":{"kind":"Name","value":"erHistorisk"}}]}}]}}]}}]}}]} as unknown as DocumentNode<HentStatsborgerskapQuery, HentStatsborgerskapQueryVariables>;