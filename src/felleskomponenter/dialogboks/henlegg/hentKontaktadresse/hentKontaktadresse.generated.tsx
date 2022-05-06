import * as Types from '../../../../graphql/generated/types';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions =  {}
export type HentKontaktadresseQueryVariables = Types.Exact<{
  behandlingID: Types.Scalars['Long'];
}>;


export type HentKontaktadresseQuery = (
  { __typename?: 'Query' }
  & { hentSaksopplysninger: (
    { __typename?: 'Saksopplysninger' }
    & { persondata: (
      { __typename?: 'Personopplysninger' }
      & { kontaktadresser: Array<(
        { __typename?: 'Kontaktadresse' }
        & Pick<Types.Kontaktadresse, 'erHistorisk'>
      )> }
    ) }
  ) }
);


export const HentKontaktadresseDocument = gql`
    query hentKontaktadresse($behandlingID: Long!) {
  hentSaksopplysninger(behandlingID: $behandlingID) {
    persondata {
      kontaktadresser {
        erHistorisk
      }
    }
  }
}
    `;

/**
 * __useHentKontaktadresseQuery__
 *
 * To run a query within a React component, call `useHentKontaktadresseQuery` and pass it any options that fit your needs.
 * When your component renders, `useHentKontaktadresseQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useHentKontaktadresseQuery({
 *   variables: {
 *      behandlingID: // value for 'behandlingID'
 *   },
 * });
 */
export function useHentKontaktadresseQuery(baseOptions: Apollo.QueryHookOptions<HentKontaktadresseQuery, HentKontaktadresseQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<HentKontaktadresseQuery, HentKontaktadresseQueryVariables>(HentKontaktadresseDocument, options);
      }
export function useHentKontaktadresseLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<HentKontaktadresseQuery, HentKontaktadresseQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<HentKontaktadresseQuery, HentKontaktadresseQueryVariables>(HentKontaktadresseDocument, options);
        }
export type HentKontaktadresseQueryHookResult = ReturnType<typeof useHentKontaktadresseQuery>;
export type HentKontaktadresseLazyQueryHookResult = ReturnType<typeof useHentKontaktadresseLazyQuery>;
export type HentKontaktadresseQueryResult = Apollo.QueryResult<HentKontaktadresseQuery, HentKontaktadresseQueryVariables>;