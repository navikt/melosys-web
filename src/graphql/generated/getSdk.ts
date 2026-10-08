/** Internal type. DO NOT USE DIRECTLY. */
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
import type { DocumentNode } from 'graphql';
import gql from 'graphql-tag';
type Maybe<T> = T | null;
type InputMaybe<T> = Maybe<T>;
/** All built-in and custom scalars, mapped to their actual values */
type Scalars = {
  ID: { input: string; output: string; }
  String: { input: string; output: string; }
  Boolean: { input: boolean; output: boolean; }
  Int: { input: number; output: number; }
  Float: { input: number; output: number; }
  Date: { input: string; output: string; }
  Long: { input: number; output: number; }
};

type Bostedsadresse = {
  __typename?: 'Bostedsadresse';
  adresse: StrukturertAdresseformat;
  coAdressenavn?: Maybe<Scalars['String']['output']>;
  erHistorisk: Scalars['Boolean']['output'];
  gyldigFraOgMed?: Maybe<Scalars['Date']['output']>;
  gyldigTilOgMed?: Maybe<Scalars['Date']['output']>;
  kilde?: Maybe<Scalars['String']['output']>;
  master: Scalars['String']['output'];
};

type Familiemedlem = {
  __typename?: 'Familiemedlem';
  alder?: Maybe<Scalars['Int']['output']>;
  fnrAnnenForelder?: Maybe<Scalars['String']['output']>;
  foreldreansvar?: Maybe<Scalars['String']['output']>;
  ident: Scalars['String']['output'];
  navn: Scalars['String']['output'];
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
  foedeland?: Maybe<Scalars['String']['output']>;
  foedested?: Maybe<Scalars['String']['output']>;
  foedselsaar: Scalars['Int']['output'];
  foedselsdato?: Maybe<Scalars['Date']['output']>;
};

type Folkeregisterpersonstatus = {
  __typename?: 'Folkeregisterpersonstatus';
  erHistorisk: Scalars['Boolean']['output'];
  fregGyldighetstidspunkt?: Maybe<Scalars['Date']['output']>;
  kilde?: Maybe<Scalars['String']['output']>;
  kode: Scalars['String']['output'];
  master: Scalars['String']['output'];
  tekst: Scalars['String']['output'];
};

enum KjoennType {
  Kvinne = 'KVINNE',
  Mann = 'MANN',
  Ukjent = 'UKJENT'
}

type Kontaktadresse = {
  __typename?: 'Kontaktadresse';
  coAdressenavn?: Maybe<Scalars['String']['output']>;
  erHistorisk: Scalars['Boolean']['output'];
  gyldigFraOgMed?: Maybe<Scalars['Date']['output']>;
  gyldigTilOgMed?: Maybe<Scalars['Date']['output']>;
  kilde?: Maybe<Scalars['String']['output']>;
  master: Scalars['String']['output'];
  semistrukturertAdresse?: Maybe<SemistrukturertAdresseformat>;
  strukturertAdresse?: Maybe<StrukturertAdresseformat>;
};

type Navn = {
  __typename?: 'Navn';
  etternavn: Scalars['String']['output'];
  fornavn: Scalars['String']['output'];
  mellomnavn?: Maybe<Scalars['String']['output']>;
};

type Oppholdsadresse = {
  __typename?: 'Oppholdsadresse';
  adresse: StrukturertAdresseformat;
  coAdressenavn?: Maybe<Scalars['String']['output']>;
  erHistorisk: Scalars['Boolean']['output'];
  gyldigFraOgMed?: Maybe<Scalars['Date']['output']>;
  gyldigTilOgMed?: Maybe<Scalars['Date']['output']>;
  kilde?: Maybe<Scalars['String']['output']>;
  master: Scalars['String']['output'];
};

type Personopplysninger = {
  __typename?: 'Personopplysninger';
  bostedsadresser: Array<Bostedsadresse>;
  familiemedlemmer: Array<Familiemedlem>;
  foedsel: Foedsel;
  folkeregisteridentifikator?: Maybe<Scalars['String']['output']>;
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
  ident: Scalars['String']['input'];
};


type QueryHentSaksopplysningerArgs = {
  behandlingID: Scalars['Long']['input'];
};

type Saksopplysninger = {
  __typename?: 'Saksopplysninger';
  behandlingID: Scalars['Long']['output'];
  persondata: Personopplysninger;
};

type SemistrukturertAdresseformat = {
  __typename?: 'SemistrukturertAdresseformat';
  adresselinje1?: Maybe<Scalars['String']['output']>;
  adresselinje2?: Maybe<Scalars['String']['output']>;
  adresselinje3?: Maybe<Scalars['String']['output']>;
  adresselinje4?: Maybe<Scalars['String']['output']>;
  land: Scalars['String']['output'];
  postnummer?: Maybe<Scalars['String']['output']>;
  poststed?: Maybe<Scalars['String']['output']>;
};

type Sivilstand = {
  __typename?: 'Sivilstand';
  bekreftelsesdato?: Maybe<Scalars['Date']['output']>;
  erHistorisk: Scalars['Boolean']['output'];
  gyldigFraOgMed?: Maybe<Scalars['Date']['output']>;
  kilde?: Maybe<Scalars['String']['output']>;
  master: Scalars['String']['output'];
  relatertVedSivilstand?: Maybe<Scalars['String']['output']>;
  type: Scalars['String']['output'];
};

type Statsborgerskap = {
  __typename?: 'Statsborgerskap';
  bekreftelsesdato?: Maybe<Scalars['Date']['output']>;
  erHistorisk: Scalars['Boolean']['output'];
  gyldigFraOgMed?: Maybe<Scalars['Date']['output']>;
  gyldigTilOgMed?: Maybe<Scalars['Date']['output']>;
  kilde?: Maybe<Scalars['String']['output']>;
  land: Scalars['String']['output'];
  master: Scalars['String']['output'];
};

type StrukturertAdresseformat = {
  __typename?: 'StrukturertAdresseformat';
  gatenavn?: Maybe<Scalars['String']['output']>;
  husnummerEtasjeLeilighet?: Maybe<Scalars['String']['output']>;
  land: Scalars['String']['output'];
  postboks?: Maybe<Scalars['String']['output']>;
  postnummer?: Maybe<Scalars['String']['output']>;
  poststed?: Maybe<Scalars['String']['output']>;
  region?: Maybe<Scalars['String']['output']>;
  tilleggsnavn?: Maybe<Scalars['String']['output']>;
};


export type Requester<C = {}> = <R, V>(doc: DocumentNode, vars?: V, options?: C) => Promise<R> | AsyncIterable<R>
export function getSdk<C>(requester: Requester<C>) {
  return {

  };
}
export type Sdk = ReturnType<typeof getSdk>;