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
  /** Custom scalar for Long */
  Long: number;
};

type Bostedsadresse = {
  __typename?: 'Bostedsadresse';
  coAdressenavn?: Maybe<Scalars['String']>;
  adresse: StrukturertAdresseformat;
  gyldigFraOgMed?: Maybe<Scalars['Date']>;
  gyldigTilOgMed?: Maybe<Scalars['Date']>;
  master: Scalars['String'];
  kilde?: Maybe<Scalars['String']>;
  erHistorisk: Scalars['Boolean'];
};


type Familiemedlem = {
  __typename?: 'Familiemedlem';
  navn: Scalars['String'];
  ident: Scalars['String'];
  relasjonsrolle: Familierelasjonsrolle;
  alder?: Maybe<Scalars['Int']>;
  foreldreansvar?: Maybe<Scalars['String']>;
  fnrAnnenForelder?: Maybe<Scalars['String']>;
  sivilstand?: Maybe<Sivilstand>;
};

enum Familierelasjonsrolle {
  Barn = 'BARN',
  Far = 'FAR',
  Mor = 'MOR',
  RelatertVedSivilstand = 'RELATERT_VED_SIVILSTAND'
}

type Foedselsdato = {
  __typename?: 'Foedselsdato';
  foedselsaar: Scalars['Int'];
  foedselsdato?: Maybe<Scalars['Date']>;
};

type Folkeregisterpersonstatus = {
  __typename?: 'Folkeregisterpersonstatus';
  kode: Scalars['String'];
  tekst: Scalars['String'];
  master: Scalars['String'];
  kilde?: Maybe<Scalars['String']>;
  fregGyldighetstidspunkt?: Maybe<Scalars['Date']>;
  erHistorisk: Scalars['Boolean'];
};

enum KjoennType {
  Kvinne = 'KVINNE',
  Mann = 'MANN',
  Ukjent = 'UKJENT'
}

type Kontaktadresse = {
  __typename?: 'Kontaktadresse';
  coAdressenavn?: Maybe<Scalars['String']>;
  semistrukturertAdresse?: Maybe<SemistrukturertAdresseformat>;
  strukturertAdresse?: Maybe<StrukturertAdresseformat>;
  gyldigFraOgMed?: Maybe<Scalars['Date']>;
  gyldigTilOgMed?: Maybe<Scalars['Date']>;
  master: Scalars['String'];
  kilde?: Maybe<Scalars['String']>;
  erHistorisk: Scalars['Boolean'];
};


type Navn = {
  __typename?: 'Navn';
  fornavn: Scalars['String'];
  mellomnavn?: Maybe<Scalars['String']>;
  etternavn: Scalars['String'];
};

type Oppholdsadresse = {
  __typename?: 'Oppholdsadresse';
  coAdressenavn?: Maybe<Scalars['String']>;
  adresse: StrukturertAdresseformat;
  gyldigFraOgMed?: Maybe<Scalars['Date']>;
  gyldigTilOgMed?: Maybe<Scalars['Date']>;
  master: Scalars['String'];
  kilde?: Maybe<Scalars['String']>;
  erHistorisk: Scalars['Boolean'];
};

type Personopplysninger = {
  __typename?: 'Personopplysninger';
  bostedsadresser: Array<Bostedsadresse>;
  familiemedlemmer: Array<Familiemedlem>;
  foedselsdato: Foedselsdato;
  folkeregisteridentifikator?: Maybe<Scalars['String']>;
  folkeregisterpersonstatuser: Array<Folkeregisterpersonstatus>;
  kjoenn: KjoennType;
  kontaktadresser: Array<Kontaktadresse>;
  navn: Navn;
  oppholdsadresser: Array<Oppholdsadresse>;
  sivilstand: Array<Sivilstand>;
  statsborgerskap: Array<Statsborgerskap>;
};

type Query = {
  __typename?: 'Query';
  hentSaksopplysninger: Saksopplysninger;
  hentPersonopplysninger: Personopplysninger;
};


type QueryHentSaksopplysningerArgs = {
  behandlingID: Scalars['Long'];
};


type QueryHentPersonopplysningerArgs = {
  ident: Scalars['String'];
};

type Saksopplysninger = {
  __typename?: 'Saksopplysninger';
  behandlingID: Scalars['Long'];
  persondata: Personopplysninger;
};

type SemistrukturertAdresseformat = {
  __typename?: 'SemistrukturertAdresseformat';
  adresselinje1?: Maybe<Scalars['String']>;
  adresselinje2?: Maybe<Scalars['String']>;
  adresselinje3?: Maybe<Scalars['String']>;
  adresselinje4?: Maybe<Scalars['String']>;
  postnummer?: Maybe<Scalars['String']>;
  poststed?: Maybe<Scalars['String']>;
  land: Scalars['String'];
};

type Sivilstand = {
  __typename?: 'Sivilstand';
  type: Scalars['String'];
  relatertVedSivilstand?: Maybe<Scalars['String']>;
  gyldigFraOgMed?: Maybe<Scalars['Date']>;
  bekreftelsesdato?: Maybe<Scalars['Date']>;
  master: Scalars['String'];
  kilde?: Maybe<Scalars['String']>;
  erHistorisk: Scalars['Boolean'];
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

type StrukturertAdresseformat = {
  __typename?: 'StrukturertAdresseformat';
  tilleggsnavn?: Maybe<Scalars['String']>;
  gatenavn?: Maybe<Scalars['String']>;
  husnummerEtasjeLeilighet?: Maybe<Scalars['String']>;
  postboks?: Maybe<Scalars['String']>;
  postnummer?: Maybe<Scalars['String']>;
  poststed?: Maybe<Scalars['String']>;
  region?: Maybe<Scalars['String']>;
  land: Scalars['String'];
};


export type Requester<C = {}> = <R, V>(doc: DocumentNode, vars?: V, options?: C) => Promise<R>
export function getSdk<C>(requester: Requester<C>) {
  return {

  };
}
export type Sdk = ReturnType<typeof getSdk>;