import { DocumentNode } from 'graphql';
type Maybe<T> = T | null;
type InputMaybe<T> = Maybe<T>;
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
  Date: string;
  Long: number;
};

type Bostedsadresse = {
  __typename?: 'Bostedsadresse';
  adresse: StrukturertAdresseformat;
  coAdressenavn?: Maybe<Scalars['String']>;
  erHistorisk: Scalars['Boolean'];
  gyldigFraOgMed?: Maybe<Scalars['Date']>;
  gyldigTilOgMed?: Maybe<Scalars['Date']>;
  kilde?: Maybe<Scalars['String']>;
  master: Scalars['String'];
};

type Familiemedlem = {
  __typename?: 'Familiemedlem';
  alder?: Maybe<Scalars['Int']>;
  fnrAnnenForelder?: Maybe<Scalars['String']>;
  foreldreansvar?: Maybe<Scalars['String']>;
  ident: Scalars['String'];
  navn: Scalars['String'];
  relasjonsrolle: Familierelasjonsrolle;
  sivilstand?: Maybe<Sivilstand>;
};

enum Familierelasjonsrolle {
  Barn = 'BARN',
  Far = 'FAR',
  Mor = 'MOR',
  RelatertVedSivilstand = 'RELATERT_VED_SIVILSTAND'
}

type Foedsel = {
  __typename?: 'Foedsel';
  foedeland?: Maybe<Scalars['String']>;
  foedested?: Maybe<Scalars['String']>;
  foedselsaar: Scalars['Int'];
  foedselsdato?: Maybe<Scalars['Date']>;
};

type Folkeregisterpersonstatus = {
  __typename?: 'Folkeregisterpersonstatus';
  erHistorisk: Scalars['Boolean'];
  fregGyldighetstidspunkt?: Maybe<Scalars['Date']>;
  kilde?: Maybe<Scalars['String']>;
  kode: Scalars['String'];
  master: Scalars['String'];
  tekst: Scalars['String'];
};

enum KjoennType {
  Kvinne = 'KVINNE',
  Mann = 'MANN',
  Ukjent = 'UKJENT'
}

type Kontaktadresse = {
  __typename?: 'Kontaktadresse';
  coAdressenavn?: Maybe<Scalars['String']>;
  erHistorisk: Scalars['Boolean'];
  gyldigFraOgMed?: Maybe<Scalars['Date']>;
  gyldigTilOgMed?: Maybe<Scalars['Date']>;
  kilde?: Maybe<Scalars['String']>;
  master: Scalars['String'];
  semistrukturertAdresse?: Maybe<SemistrukturertAdresseformat>;
  strukturertAdresse?: Maybe<StrukturertAdresseformat>;
};

type Navn = {
  __typename?: 'Navn';
  etternavn: Scalars['String'];
  fornavn: Scalars['String'];
  mellomnavn?: Maybe<Scalars['String']>;
};

type Oppholdsadresse = {
  __typename?: 'Oppholdsadresse';
  adresse: StrukturertAdresseformat;
  coAdressenavn?: Maybe<Scalars['String']>;
  erHistorisk: Scalars['Boolean'];
  gyldigFraOgMed?: Maybe<Scalars['Date']>;
  gyldigTilOgMed?: Maybe<Scalars['Date']>;
  kilde?: Maybe<Scalars['String']>;
  master: Scalars['String'];
};

type Personopplysninger = {
  __typename?: 'Personopplysninger';
  bostedsadresser: Array<Bostedsadresse>;
  familiemedlemmer: Array<Familiemedlem>;
  foedsel: Foedsel;
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
  hentPersonopplysninger: Personopplysninger;
  hentSaksopplysninger: Saksopplysninger;
};


type QueryHentPersonopplysningerArgs = {
  ident: Scalars['String'];
};


type QueryHentSaksopplysningerArgs = {
  behandlingID: Scalars['Long'];
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
  land: Scalars['String'];
  postnummer?: Maybe<Scalars['String']>;
  poststed?: Maybe<Scalars['String']>;
};

type Sivilstand = {
  __typename?: 'Sivilstand';
  bekreftelsesdato?: Maybe<Scalars['Date']>;
  erHistorisk: Scalars['Boolean'];
  gyldigFraOgMed?: Maybe<Scalars['Date']>;
  kilde?: Maybe<Scalars['String']>;
  master: Scalars['String'];
  relatertVedSivilstand?: Maybe<Scalars['String']>;
  type: Scalars['String'];
};

type Statsborgerskap = {
  __typename?: 'Statsborgerskap';
  bekreftelsesdato?: Maybe<Scalars['Date']>;
  erHistorisk: Scalars['Boolean'];
  gyldigFraOgMed?: Maybe<Scalars['Date']>;
  gyldigTilOgMed?: Maybe<Scalars['Date']>;
  kilde?: Maybe<Scalars['String']>;
  land: Scalars['String'];
  master: Scalars['String'];
};

type StrukturertAdresseformat = {
  __typename?: 'StrukturertAdresseformat';
  gatenavn?: Maybe<Scalars['String']>;
  husnummerEtasjeLeilighet?: Maybe<Scalars['String']>;
  land: Scalars['String'];
  postboks?: Maybe<Scalars['String']>;
  postnummer?: Maybe<Scalars['String']>;
  poststed?: Maybe<Scalars['String']>;
  region?: Maybe<Scalars['String']>;
  tilleggsnavn?: Maybe<Scalars['String']>;
};


export type Requester<C = {}, E = unknown> = <R, V>(doc: DocumentNode, vars?: V, options?: C) => Promise<R> | AsyncIterable<R>
export function getSdk<C, E>(requester: Requester<C, E>) {
  return {

  };
}
export type Sdk = ReturnType<typeof getSdk>;
