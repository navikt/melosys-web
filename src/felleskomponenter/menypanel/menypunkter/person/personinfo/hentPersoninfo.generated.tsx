import * as Types from '../../../../../graphql/generated/types';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type HentPersoninfoQueryVariables = Types.Exact<{
  behandlingID: Types.Scalars['Long'];
}>;


export type HentPersoninfoQuery = { __typename?: 'Query', hentSaksopplysninger: { __typename?: 'Saksopplysninger', persondata: { __typename?: 'Personopplysninger', folkeregisterpersonstatuser: Array<{ __typename?: 'Folkeregisterpersonstatus', kode: string, tekst: string, master: string, kilde?: string | null, fregGyldighetstidspunkt?: string | null, erHistorisk: boolean }>, foedsel: { __typename?: 'Foedsel', foedselsaar: number, foedselsdato?: string | null, foedeland?: string | null, foedested?: string | null }, sivilstand: Array<{ __typename?: 'Sivilstand', type: string, relatertVedSivilstand?: string | null, gyldigFraOgMed?: string | null, bekreftelsesdato?: string | null, master: string, kilde?: string | null, erHistorisk: boolean }> } } };


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
        foedeland
        foedested
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
  const options = { ...defaultOptions, ...baseOptions }
  return Apollo.useQuery<HentPersoninfoQuery, HentPersoninfoQueryVariables>(HentPersoninfoDocument, options);
}
export function useHentPersoninfoLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<HentPersoninfoQuery, HentPersoninfoQueryVariables>) {
  const options = { ...defaultOptions, ...baseOptions }
  return Apollo.useLazyQuery<HentPersoninfoQuery, HentPersoninfoQueryVariables>(HentPersoninfoDocument, options);
}
export type HentPersoninfoQueryHookResult = ReturnType<typeof useHentPersoninfoQuery>;
export type HentPersoninfoLazyQueryHookResult = ReturnType<typeof useHentPersoninfoLazyQuery>;
export type HentPersoninfoQueryResult = Apollo.QueryResult<HentPersoninfoQuery, HentPersoninfoQueryVariables>;