import * as Types from '../../../../../../graphql/generated/types';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions =  {}
export type HentAdresserQueryVariables = Types.Exact<{
  behandlingID: Types.Scalars['Long'];
}>;


export type HentAdresserQuery = (
  { __typename?: 'Query' }
  & { hentSaksopplysninger: (
    { __typename?: 'Saksopplysninger' }
    & { persondata: (
      { __typename?: 'Personopplysninger' }
      & { bostedsadresser: Array<(
        { __typename?: 'Bostedsadresse' }
        & Pick<Types.Bostedsadresse, 'coAdressenavn' | 'gyldigFraOgMed' | 'gyldigTilOgMed' | 'kilde' | 'master' | 'erHistorisk'>
        & { adresse: (
          { __typename?: 'StrukturertAdresseformat' }
          & Pick<Types.StrukturertAdresseformat, 'tilleggsnavn' | 'gatenavn' | 'husnummerEtasjeLeilighet' | 'postboks' | 'postnummer' | 'poststed' | 'region' | 'land'>
        ) }
      )>, oppholdsadresser: Array<(
        { __typename?: 'Oppholdsadresse' }
        & Pick<Types.Oppholdsadresse, 'coAdressenavn' | 'gyldigFraOgMed' | 'gyldigTilOgMed' | 'kilde' | 'master' | 'erHistorisk'>
        & { adresse: (
          { __typename?: 'StrukturertAdresseformat' }
          & Pick<Types.StrukturertAdresseformat, 'tilleggsnavn' | 'gatenavn' | 'husnummerEtasjeLeilighet' | 'postboks' | 'postnummer' | 'poststed' | 'region' | 'land'>
        ) }
      )>, kontaktadresser: Array<(
        { __typename?: 'Kontaktadresse' }
        & Pick<Types.Kontaktadresse, 'coAdressenavn' | 'gyldigFraOgMed' | 'gyldigTilOgMed' | 'master' | 'kilde' | 'erHistorisk'>
        & { semistrukturertAdresse?: Types.Maybe<(
          { __typename?: 'SemistrukturertAdresseformat' }
          & Pick<Types.SemistrukturertAdresseformat, 'adresselinje1' | 'adresselinje2' | 'adresselinje3' | 'adresselinje4' | 'postnummer' | 'poststed' | 'land'>
        )>, strukturertAdresse?: Types.Maybe<(
          { __typename?: 'StrukturertAdresseformat' }
          & Pick<Types.StrukturertAdresseformat, 'tilleggsnavn' | 'gatenavn' | 'husnummerEtasjeLeilighet' | 'postboks' | 'postnummer' | 'poststed' | 'region' | 'land'>
        )> }
      )> }
    ) }
  ) }
);


export const HentAdresserDocument = gql`
    query hentAdresser($behandlingID: Long!) {
  hentSaksopplysninger(behandlingID: $behandlingID) {
    persondata {
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
      oppholdsadresser {
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
      kontaktadresser {
        coAdressenavn
        semistrukturertAdresse {
          adresselinje1
          adresselinje2
          adresselinje3
          adresselinje4
          postnummer
          poststed
          land
        }
        strukturertAdresse {
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
        master
        kilde
        erHistorisk
      }
    }
  }
}
    `;

/**
 * __useHentAdresserQuery__
 *
 * To run a query within a React component, call `useHentAdresserQuery` and pass it any options that fit your needs.
 * When your component renders, `useHentAdresserQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useHentAdresserQuery({
 *   variables: {
 *      behandlingID: // value for 'behandlingID'
 *   },
 * });
 */
export function useHentAdresserQuery(baseOptions: Apollo.QueryHookOptions<HentAdresserQuery, HentAdresserQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<HentAdresserQuery, HentAdresserQueryVariables>(HentAdresserDocument, options);
      }
export function useHentAdresserLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<HentAdresserQuery, HentAdresserQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<HentAdresserQuery, HentAdresserQueryVariables>(HentAdresserDocument, options);
        }
export type HentAdresserQueryHookResult = ReturnType<typeof useHentAdresserQuery>;
export type HentAdresserLazyQueryHookResult = ReturnType<typeof useHentAdresserLazyQuery>;
export type HentAdresserQueryResult = Apollo.QueryResult<HentAdresserQuery, HentAdresserQueryVariables>;