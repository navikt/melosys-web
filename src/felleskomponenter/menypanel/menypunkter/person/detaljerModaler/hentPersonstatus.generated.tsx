import * as Types from '../../../../../graphql/generated/types';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions =  {}
export type HentPersonstatusQueryVariables = Types.Exact<{
  behandlingID: Types.Scalars['Long'];
}>;


export type HentPersonstatusQuery = (
  { __typename?: 'Query' }
  & { hentSaksopplysninger: (
    { __typename?: 'Saksopplysninger' }
    & { persondata: (
      { __typename?: 'Personopplysninger' }
      & { folkeregisterpersonstatuser: Array<(
        { __typename?: 'Folkeregisterpersonstatus' }
        & Pick<Types.Folkeregisterpersonstatus, 'kode' | 'tekst' | 'master' | 'kilde' | 'fregGyldighetstidspunkt' | 'erHistorisk'>
      )> }
    ) }
  ) }
);


export const HentPersonstatusDocument = gql`
    query hentPersonstatus($behandlingID: Long!) {
  hentSaksopplysninger(behandlingID: $behandlingID) {
    persondata {
      folkeregisterpersonstatuser {
        kode
        tekst
        master
        kilde
        fregGyldighetstidspunkt
        erHistorisk
      }
    }
  }
}
    `;

/**
 * __useHentPersonstatusQuery__
 *
 * To run a query within a React component, call `useHentPersonstatusQuery` and pass it any options that fit your needs.
 * When your component renders, `useHentPersonstatusQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useHentPersonstatusQuery({
 *   variables: {
 *      behandlingID: // value for 'behandlingID'
 *   },
 * });
 */
export function useHentPersonstatusQuery(baseOptions: Apollo.QueryHookOptions<HentPersonstatusQuery, HentPersonstatusQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<HentPersonstatusQuery, HentPersonstatusQueryVariables>(HentPersonstatusDocument, options);
      }
export function useHentPersonstatusLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<HentPersonstatusQuery, HentPersonstatusQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<HentPersonstatusQuery, HentPersonstatusQueryVariables>(HentPersonstatusDocument, options);
        }
export type HentPersonstatusQueryHookResult = ReturnType<typeof useHentPersonstatusQuery>;
export type HentPersonstatusLazyQueryHookResult = ReturnType<typeof useHentPersonstatusLazyQuery>;
export type HentPersonstatusQueryResult = Apollo.QueryResult<HentPersonstatusQuery, HentPersonstatusQueryVariables>;