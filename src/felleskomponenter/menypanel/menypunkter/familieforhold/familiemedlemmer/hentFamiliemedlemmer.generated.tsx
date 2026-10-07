import * as Types from '../../../../../graphql/generated/types';
import { gql } from '@apollo/client';
import type * as ApolloReactCommon from '@apollo/client/react';
import * as ApolloReactHooks from '@apollo/client/react';

const defaultOptions = {} as const;

export type HentFamiliemedlemmerQueryVariables = Types.Exact<{
  behandlingID: Types.Scalars['Long'];
}>;


export type HentFamiliemedlemmerQuery = (
  { __typename?: 'Query' }
  & { hentSaksopplysninger: (
    { __typename?: 'Saksopplysninger' }
    & { persondata: (
      { __typename?: 'Personopplysninger' }
      & { familiemedlemmer: Array<(
        { __typename?: 'Familiemedlem' }
        & Pick<Types.Familiemedlem, 'navn' | 'ident' | 'relasjonsrolle' | 'alder' | 'foreldreansvar' | 'fnrAnnenForelder'>
        & { sivilstand?: Types.Maybe<(
          { __typename?: 'Sivilstand' }
          & Pick<Types.Sivilstand, 'type' | 'gyldigFraOgMed' | 'erHistorisk' | 'master'>
        )> }
      )> }
    ) }
  ) }
);


export const HentFamiliemedlemmerDocument = gql`
    query hentFamiliemedlemmer($behandlingID: Long!) {
  hentSaksopplysninger(behandlingID: $behandlingID) {
    persondata {
      familiemedlemmer {
        navn
        ident
        relasjonsrolle
        alder
        foreldreansvar
        fnrAnnenForelder
        sivilstand {
          type
          gyldigFraOgMed
          erHistorisk
          master
        }
      }
    }
  }
}
    `;

/**
 * __useHentFamiliemedlemmerQuery__
 *
 * To run a query within a React component, call `useHentFamiliemedlemmerQuery` and pass it any options that fit your needs.
 * When your component renders, `useHentFamiliemedlemmerQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useHentFamiliemedlemmerQuery({
 *   variables: {
 *      behandlingID: // value for 'behandlingID'
 *   },
 * });
 */
export function useHentFamiliemedlemmerQuery(baseOptions: ApolloReactHooks.QueryHookOptions<HentFamiliemedlemmerQuery, HentFamiliemedlemmerQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return ApolloReactHooks.useQuery<HentFamiliemedlemmerQuery, HentFamiliemedlemmerQueryVariables>(HentFamiliemedlemmerDocument, options);
      }
export function useHentFamiliemedlemmerLazyQuery(baseOptions?: ApolloReactHooks.LazyQueryHookOptions<HentFamiliemedlemmerQuery, HentFamiliemedlemmerQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return ApolloReactHooks.useLazyQuery<HentFamiliemedlemmerQuery, HentFamiliemedlemmerQueryVariables>(HentFamiliemedlemmerDocument, options);
        }
export type HentFamiliemedlemmerQueryHookResult = ReturnType<typeof useHentFamiliemedlemmerQuery>;
export type HentFamiliemedlemmerLazyQueryHookResult = ReturnType<typeof useHentFamiliemedlemmerLazyQuery>;
export type HentFamiliemedlemmerQueryResult = ApolloReactCommon.QueryResult<HentFamiliemedlemmerQuery, HentFamiliemedlemmerQueryVariables>;