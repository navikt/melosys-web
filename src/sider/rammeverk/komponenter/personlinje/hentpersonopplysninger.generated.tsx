import * as Types from '../../../../graphql/generated/types';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions =  {}
export type HentPersonopplysningerQueryVariables = Types.Exact<{
  behandlingID: Types.Scalars['Long'];
}>;


export type HentPersonopplysningerQuery = (
  { __typename?: 'Query' }
  & { hentSaksopplysninger: (
    { __typename?: 'Saksopplysninger' }
    & { persondata: (
      { __typename?: 'Personopplysninger' }
      & Pick<Types.Personopplysninger, 'kjoenn' | 'folkeregisteridentifikator'>
      & { navn: (
        { __typename?: 'Navn' }
        & Pick<Types.Navn, 'fornavn' | 'mellomnavn' | 'etternavn'>
      ), folkeregisterpersonstatus?: Types.Maybe<(
        { __typename?: 'Folkeregisterpersonstatus' }
        & Pick<Types.Folkeregisterpersonstatus, 'kode'>
      )>, statsborgerskap: Array<(
        { __typename?: 'Statsborgerskap' }
        & Pick<Types.Statsborgerskap, 'land' | 'erHistorisk'>
      )>, sivilstand: Array<(
        { __typename?: 'Sivilstand' }
        & Pick<Types.Sivilstand, 'type' | 'erHistorisk'>
      )> }
    ) }
  ) }
);


export const HentPersonopplysningerDocument = gql`
    query hentPersonopplysninger($behandlingID: Long!) {
  hentSaksopplysninger(behandlingID: $behandlingID) {
    persondata {
      navn {
        fornavn
        mellomnavn
        etternavn
      }
      kjoenn
      folkeregisterpersonstatus {
        kode
      }
      folkeregisteridentifikator
      statsborgerskap {
        land
        erHistorisk
      }
      sivilstand {
        type
        erHistorisk
      }
    }
  }
}
    `;

/**
 * __useHentPersonopplysningerQuery__
 *
 * To run a query within a React component, call `useHentPersonopplysningerQuery` and pass it any options that fit your needs.
 * When your component renders, `useHentPersonopplysningerQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useHentPersonopplysningerQuery({
 *   variables: {
 *      behandlingID: // value for 'behandlingID'
 *   },
 * });
 */
export function useHentPersonopplysningerQuery(baseOptions: Apollo.QueryHookOptions<HentPersonopplysningerQuery, HentPersonopplysningerQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<HentPersonopplysningerQuery, HentPersonopplysningerQueryVariables>(HentPersonopplysningerDocument, options);
      }
export function useHentPersonopplysningerLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<HentPersonopplysningerQuery, HentPersonopplysningerQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<HentPersonopplysningerQuery, HentPersonopplysningerQueryVariables>(HentPersonopplysningerDocument, options);
        }
export type HentPersonopplysningerQueryHookResult = ReturnType<typeof useHentPersonopplysningerQuery>;
export type HentPersonopplysningerLazyQueryHookResult = ReturnType<typeof useHentPersonopplysningerLazyQuery>;
export type HentPersonopplysningerQueryResult = Apollo.QueryResult<HentPersonopplysningerQuery, HentPersonopplysningerQueryVariables>;