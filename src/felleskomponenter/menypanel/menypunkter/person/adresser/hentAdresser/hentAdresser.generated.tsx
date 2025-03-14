import * as Types from '../../../../../../graphql/generated/types';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type HentAdresserQueryVariables = Types.Exact<{
  behandlingID: Types.Scalars['Long'];
}>;


export type HentAdresserQuery = {
  __typename?: 'Query';
  hentSaksopplysninger: {
    __typename?: 'Saksopplysninger';
    persondata: {
      __typename?: 'Personopplysninger';
      bostedsadresser: Array<{
        __typename?: 'Bostedsadresse';
        coAdressenavn?: string | null;
        gyldigFraOgMed?: string | null;
        gyldigTilOgMed?: string | null;
        kilde?: string | null;
        master: string;
        erHistorisk: boolean;
        adresse: {
          __typename?: 'StrukturertAdresseformat';
          tilleggsnavn?: string | null;
          gatenavn?: string | null;
          husnummerEtasjeLeilighet?: string | null;
          postboks?: string | null;
          postnummer?: string | null;
          poststed?: string | null;
          region?: string | null;
          land: string;
        };
      }>;
      oppholdsadresser: Array<{
        __typename?: 'Oppholdsadresse';
        coAdressenavn?: string | null;
        gyldigFraOgMed?: string | null;
        gyldigTilOgMed?: string | null;
        kilde?: string | null;
        master: string;
        erHistorisk: boolean;
        adresse: {
          __typename?: 'StrukturertAdresseformat';
          tilleggsnavn?: string | null;
          gatenavn?: string | null;
          husnummerEtasjeLeilighet?: string | null;
          postboks?: string | null;
          postnummer?: string | null;
          poststed?: string | null;
          region?: string | null;
          land: string;
        };
      }>;
      kontaktadresser: Array<{
        __typename?: 'Kontaktadresse';
        coAdressenavn?: string | null;
        gyldigFraOgMed?: string | null;
        gyldigTilOgMed?: string | null;
        master: string;
        kilde?: string | null;
        erHistorisk: boolean;
        semistrukturertAdresse?: {
          __typename?: 'SemistrukturertAdresseformat';
          adresselinje1?: string | null;
          adresselinje2?: string | null;
          adresselinje3?: string | null;
          adresselinje4?: string | null;
          postnummer?: string | null;
          poststed?: string | null;
          land: string;
        } | null;
        strukturertAdresse?: {
          __typename?: 'StrukturertAdresseformat';
          tilleggsnavn?: string | null;
          gatenavn?: string | null;
          husnummerEtasjeLeilighet?: string | null;
          postboks?: string | null;
          postnummer?: string | null;
          poststed?: string | null;
          region?: string | null;
          land: string;
        } | null;
      }>;
    };
  };
};

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