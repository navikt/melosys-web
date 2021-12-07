import * as Types from '../../../../../../graphql/generated/types';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions =  {}
export type HentSivilstandQueryVariables = Types.Exact<{
  behandlingID: Types.Scalars['Long'];
}>;


export type HentSivilstandQuery = (
  { __typename?: 'Query' }
  & { hentSaksopplysninger: (
    { __typename?: 'Saksopplysninger' }
    & { persondata: (
      { __typename?: 'Personopplysninger' }
      & { sivilstand: Array<(
        { __typename?: 'Sivilstand' }
        & Pick<Types.Sivilstand, 'type' | 'relatertVedSivilstand' | 'gyldigFraOgMed' | 'bekreftelsesdato' | 'master' | 'kilde' | 'erHistorisk'>
      )> }
    ) }
  ) }
);


export const HentSivilstandDocument = gql`
    query hentSivilstand($behandlingID: Long!) {
  hentSaksopplysninger(behandlingID: $behandlingID) {
    persondata {
      sivilstand {
        type
        relatertVedSivilstand
        gyldigFraOgMed
        bekreftelsesdato
        master
        kilde
        erHistorisk
      }
    }
  }
}
    `;

/**
 * __useHentSivilstandQuery__
 *
 * To run a query within a React component, call `useHentSivilstandQuery` and pass it any options that fit your needs.
 * When your component renders, `useHentSivilstandQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useHentSivilstandQuery({
 *   variables: {
 *      behandlingID: // value for 'behandlingID'
 *   },
 * });
 */
export function useHentSivilstandQuery(baseOptions: Apollo.QueryHookOptions<HentSivilstandQuery, HentSivilstandQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<HentSivilstandQuery, HentSivilstandQueryVariables>(HentSivilstandDocument, options);
      }
export function useHentSivilstandLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<HentSivilstandQuery, HentSivilstandQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<HentSivilstandQuery, HentSivilstandQueryVariables>(HentSivilstandDocument, options);
        }
export type HentSivilstandQueryHookResult = ReturnType<typeof useHentSivilstandQuery>;
export type HentSivilstandLazyQueryHookResult = ReturnType<typeof useHentSivilstandLazyQuery>;
export type HentSivilstandQueryResult = Apollo.QueryResult<HentSivilstandQuery, HentSivilstandQueryVariables>;
