import * as Types from '../../../../../graphql/generated/types';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';

const defaultOptions =  {}
export type HentPersoninfoQueryVariables = Types.Exact<{
  behandlingID: Types.Scalars['Long'];
}>;


export type HentPersoninfoQuery = (
  { __typename?: 'Query' }
  & { hentSaksopplysninger: (
    { __typename?: 'Saksopplysninger' }
    & { persondata: (
      { __typename?: 'Personopplysninger' }
      & { folkeregisterpersonstatuser: Array<(
        { __typename?: 'Folkeregisterpersonstatus' }
        & Pick<Types.Folkeregisterpersonstatus, 'kode' | 'tekst' | 'master' | 'kilde' | 'fregGyldighetstidspunkt' | 'erHistorisk'>
      )>, foedsel: (
        { __typename?: 'Foedsel' }
        & Pick<Types.Foedsel, 'foedselsaar' | 'foedselsdato'>
      ), sivilstand: Array<(
        { __typename?: 'Sivilstand' }
        & Pick<Types.Sivilstand, 'type' | 'relatertVedSivilstand' | 'gyldigFraOgMed' | 'bekreftelsesdato' | 'master' | 'kilde' | 'erHistorisk'>
      )> }
    ) }
  ) }
);


export const HentPersoninfoDocument = gql`
    query hentPersoninfo($behandlingID: Long!) {
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
      foedsel {
        foedselsaar
        foedselsdato
      }
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
 * __useHentPersoninfoQuery__
 *
 * To run a query within a React component, call `useHentPersoninfoQuery` and pass it any options that fit your needs.
 * When your component renders, `useHentPersoninfoQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useHentPersoninfoQuery({
 *   variables: {
 *      behandlingID: // value for 'behandlingID'
 *   },
 * });
 */
export function useHentPersoninfoQuery(baseOptions: Apollo.QueryHookOptions<HentPersoninfoQuery, HentPersoninfoQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<HentPersoninfoQuery, HentPersoninfoQueryVariables>(HentPersoninfoDocument, options);
      }
export function useHentPersoninfoLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<HentPersoninfoQuery, HentPersoninfoQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<HentPersoninfoQuery, HentPersoninfoQueryVariables>(HentPersoninfoDocument, options);
        }
export type HentPersoninfoQueryHookResult = ReturnType<typeof useHentPersoninfoQuery>;
export type HentPersoninfoLazyQueryHookResult = ReturnType<typeof useHentPersoninfoLazyQuery>;
export type HentPersoninfoQueryResult = Apollo.QueryResult<HentPersoninfoQuery, HentPersoninfoQueryVariables>;