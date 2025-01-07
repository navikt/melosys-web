import * as Types from '../generated/types';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';

const defaultOptions =  {}
export type HentBostedsadresseForPersonQueryVariables = Types.Exact<{
  ident: Types.Scalars['String'];
}>;


export type HentBostedsadresseForPersonQuery = (
  { __typename?: 'Query' }
  & { hentPersonopplysninger: (
    { __typename?: 'Personopplysninger' }
    & { bostedsadresser: Array<(
      { __typename?: 'Bostedsadresse' }
      & Pick<Types.Bostedsadresse, 'coAdressenavn' | 'gyldigFraOgMed' | 'gyldigTilOgMed' | 'kilde' | 'master' | 'erHistorisk'>
      & { adresse: (
        { __typename?: 'StrukturertAdresseformat' }
        & Pick<Types.StrukturertAdresseformat, 'tilleggsnavn' | 'gatenavn' | 'husnummerEtasjeLeilighet' | 'postboks' | 'postnummer' | 'poststed' | 'region' | 'land'>
      ) }
    )>, navn: (
      { __typename?: 'Navn' }
      & Pick<Types.Navn, 'fornavn' | 'mellomnavn' | 'etternavn'>
    ) }
  ) }
);


export const HentBostedsadresseForPersonDocument = gql`
    query hentBostedsadresseForPerson($ident: String!) {
  hentPersonopplysninger(ident: $ident) {
    bostedsadresser {
      coAdressenavn
      adresse {
        tilleggsnavn
        gatenavn
        husnummerEtasjeLeilighet
        postboks
        postnummer
        poststed
        region
        land
      }
      gyldigFraOgMed
      gyldigTilOgMed
      kilde
      master
      erHistorisk
    }
    navn {
      fornavn
      mellomnavn
      etternavn
    }
  }
}
    `;

/**
 * __useHentBostedsadresseForPersonQuery__
 *
 * To run a query within a React component, call `useHentBostedsadresseForPersonQuery` and pass it any options that fit your needs.
 * When your component renders, `useHentBostedsadresseForPersonQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useHentBostedsadresseForPersonQuery({
 *   variables: {
 *      ident: // value for 'ident'
 *   },
 * });
 */
export function useHentBostedsadresseForPersonQuery(baseOptions: Apollo.QueryHookOptions<HentBostedsadresseForPersonQuery, HentBostedsadresseForPersonQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<HentBostedsadresseForPersonQuery, HentBostedsadresseForPersonQueryVariables>(HentBostedsadresseForPersonDocument, options);
      }
export function useHentBostedsadresseForPersonLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<HentBostedsadresseForPersonQuery, HentBostedsadresseForPersonQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<HentBostedsadresseForPersonQuery, HentBostedsadresseForPersonQueryVariables>(HentBostedsadresseForPersonDocument, options);
        }
export type HentBostedsadresseForPersonQueryHookResult = ReturnType<typeof useHentBostedsadresseForPersonQuery>;
export type HentBostedsadresseForPersonLazyQueryHookResult = ReturnType<typeof useHentBostedsadresseForPersonLazyQuery>;
export type HentBostedsadresseForPersonQueryResult = Apollo.QueryResult<HentBostedsadresseForPersonQuery, HentBostedsadresseForPersonQueryVariables>;
