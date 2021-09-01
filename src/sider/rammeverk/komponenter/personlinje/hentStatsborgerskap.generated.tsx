import * as Types from '../../../../graphql/generated/types';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions =  {}
export type HentStatsborgerskapQueryVariables = Types.Exact<{
  behandlingID: Types.Scalars['Long'];
}>;


export type HentStatsborgerskapQuery = (
  { __typename?: 'Query' }
  & { hentSaksopplysninger: (
    { __typename?: 'Saksopplysninger' }
    & { persondata: (
      { __typename?: 'Personopplysninger' }
      & { statsborgerskap: Array<(
        { __typename?: 'Statsborgerskap' }
        & Pick<Types.Statsborgerskap, 'land' | 'erHistorisk'>
      )> }
    ) }
  ) }
);


export const HentStatsborgerskapDocument = gql`
    query hentStatsborgerskap($behandlingID: Long!) {
  hentSaksopplysninger(behandlingID: $behandlingID) {
    persondata {
      statsborgerskap {
        land
        erHistorisk
      }
    }
  }
}
    `;

/**
 * __useHentStatsborgerskapQuery__
 *
 * To run a query within a React component, call `useHentStatsborgerskapQuery` and pass it any options that fit your needs.
 * When your component renders, `useHentStatsborgerskapQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useHentStatsborgerskapQuery({
 *   variables: {
 *      behandlingID: // value for 'behandlingID'
 *   },
 * });
 */
export function useHentStatsborgerskapQuery(baseOptions: Apollo.QueryHookOptions<HentStatsborgerskapQuery, HentStatsborgerskapQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<HentStatsborgerskapQuery, HentStatsborgerskapQueryVariables>(HentStatsborgerskapDocument, options);
      }
export function useHentStatsborgerskapLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<HentStatsborgerskapQuery, HentStatsborgerskapQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<HentStatsborgerskapQuery, HentStatsborgerskapQueryVariables>(HentStatsborgerskapDocument, options);
        }
export type HentStatsborgerskapQueryHookResult = ReturnType<typeof useHentStatsborgerskapQuery>;
export type HentStatsborgerskapLazyQueryHookResult = ReturnType<typeof useHentStatsborgerskapLazyQuery>;
export type HentStatsborgerskapQueryResult = Apollo.QueryResult<HentStatsborgerskapQuery, HentStatsborgerskapQueryVariables>;