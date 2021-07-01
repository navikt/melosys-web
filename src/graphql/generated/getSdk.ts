import { DocumentNode } from 'graphql';
import gql from 'graphql-tag';
type Maybe<T> = T | null;
type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
/** All built-in and custom scalars, mapped to their actual values */
type Scalars = {
  ID: string;
  String: string;
  Boolean: boolean;
  Int: number;
  Float: number;
  /** Format: YYYY-MM-DD (ISO-8601), example: 2017-11-24 */
  Date: string;
  /** Format: YYYY-MM-DDTHH:mm:SS (ISO-8601), example: 2011-12-03T10:15:30 */
  DateTime: string;
  /** Custom scalar for Long */
  Long: number;
};




type Personopplysninger = {
  __typename?: 'Personopplysninger';
  statsborgerskap: Array<Statsborgerskap>;
};

type Query = {
  __typename?: 'Query';
  hentSaksopplysninger: Saksopplysninger;
};


type QueryHentSaksopplysningerArgs = {
  behandlingID: Scalars['Long'];
};

type Saksopplysninger = {
  __typename?: 'Saksopplysninger';
  behandlingID: Scalars['Long'];
  persondata: Personopplysninger;
};

type Statsborgerskap = {
  __typename?: 'Statsborgerskap';
  land: Scalars['String'];
  bekreftelsesdato?: Maybe<Scalars['Date']>;
  gyldigFraOgMed?: Maybe<Scalars['Date']>;
  gyldigTilOgMed?: Maybe<Scalars['Date']>;
  master: Scalars['String'];
  kilde?: Maybe<Scalars['String']>;
  erHistorisk: Scalars['Boolean'];
};

type HentStatsborgerskapQueryVariables = Exact<{
  behandlingID: Scalars['Long'];
}>;


type HentStatsborgerskapQuery = (
  { __typename?: 'Query' }
  & { hentSaksopplysninger: (
    { __typename?: 'Saksopplysninger' }
    & { persondata: (
      { __typename?: 'Personopplysninger' }
      & { statsborgerskap: Array<(
        { __typename?: 'Statsborgerskap' }
        & Pick<Statsborgerskap, 'land' | 'bekreftelsesdato' | 'gyldigFraOgMed' | 'gyldigTilOgMed' | 'master' | 'kilde' | 'erHistorisk'>
      )> }
    ) }
  ) }
);


 const HentStatsborgerskapDocument = gql`
    query hentStatsborgerskap($behandlingID: Long!) {
  hentSaksopplysninger(behandlingID: $behandlingID) {
    persondata {
      statsborgerskap {
        land
        bekreftelsesdato
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
export type Requester<C= {}> = <R, V>(doc: DocumentNode, vars?: V, options?: C) => Promise<R>
export function getSdk<C>(requester: Requester<C>) {
  return {
    hentStatsborgerskap(variables: HentStatsborgerskapQueryVariables, options?: C): Promise<HentStatsborgerskapQuery> {
      return requester<HentStatsborgerskapQuery, HentStatsborgerskapQueryVariables>(HentStatsborgerskapDocument, variables, options);
    }
  };
}
export type Sdk = ReturnType<typeof getSdk>;