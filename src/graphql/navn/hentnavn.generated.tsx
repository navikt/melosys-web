import * as Types from '../generated/types';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions =  {}
export type HentNavnQueryVariables = Types.Exact<{
  ident: Types.Scalars['String'];
}>;


export type HentNavnQuery = (
  { __typename?: 'Query' }
  & { hentPersonopplysninger: (
    { __typename?: 'Personopplysninger' }
    & { navn: (
      { __typename?: 'Navn' }
      & Pick<Types.Navn, 'fornavn' | 'mellomnavn' | 'etternavn'>
    ) }
  ) }
);


export const HentNavnDocument = gql`
    query hentNavn($ident: String!) {
  hentPersonopplysninger(ident: $ident) {
    navn {
      fornavn
      mellomnavn
      etternavn
    }
  }
}
    `;

/**
 * __useHentNavnQuery__
 *
 * To run a query within a React component, call `useHentNavnQuery` and pass it any options that fit your needs.
 * When your component renders, `useHentNavnQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useHentNavnQuery({
 *   variables: {
 *      ident: // value for 'ident'
 *   },
 * });
 */
export function useHentNavnQuery(baseOptions: Apollo.QueryHookOptions<HentNavnQuery, HentNavnQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<HentNavnQuery, HentNavnQueryVariables>(HentNavnDocument, options);
      }
export function useHentNavnLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<HentNavnQuery, HentNavnQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<HentNavnQuery, HentNavnQueryVariables>(HentNavnDocument, options);
        }
export type HentNavnQueryHookResult = ReturnType<typeof useHentNavnQuery>;
export type HentNavnLazyQueryHookResult = ReturnType<typeof useHentNavnLazyQuery>;
export type HentNavnQueryResult = Apollo.QueryResult<HentNavnQuery, HentNavnQueryVariables>;
