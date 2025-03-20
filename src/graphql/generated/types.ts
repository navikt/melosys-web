export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: string;
  String: string;
  Boolean: boolean;
  Int: number;
  Float: number;
  Date: string;
  Long: number;
};

export type Bostedsadresse = {
  __typename?: 'Bostedsadresse';
  adresse: StrukturertAdresseformat;
  coAdressenavn?: Maybe<Scalars['String']>;
  erHistorisk: Scalars['Boolean'];
  gyldigFraOgMed?: Maybe<Scalars['Date']>;
  gyldigTilOgMed?: Maybe<Scalars['Date']>;
  kilde?: Maybe<Scalars['String']>;
  master: Scalars['String'];
};

export type Familiemedlem = {
  __typename?: 'Familiemedlem';
  alder?: Maybe<Scalars['Int']>;
  fnrAnnenForelder?: Maybe<Scalars['String']>;
  foreldreansvar?: Maybe<Scalars['String']>;
  ident: Scalars['String'];
  navn: Scalars['String'];
  relasjonsrolle: Familierelasjonsrolle;
  sivilstand?: Maybe<Sivilstand>;
};

export enum Familierelasjonsrolle {
  Barn = 'BARN',
  Far = 'FAR',
  Mor = 'MOR',
  RelatertVedSivilstand = 'RELATERT_VED_SIVILSTAND'
}

export type Foedsel = {
  __typename?: 'Foedsel';
  foedeland?: Maybe<Scalars['String']>;
  foedested?: Maybe<Scalars['String']>;
  foedselsaar: Scalars['Int'];
  foedselsdato?: Maybe<Scalars['Date']>;
};

export type Folkeregisterpersonstatus = {
  __typename?: 'Folkeregisterpersonstatus';
  erHistorisk: Scalars['Boolean'];
  fregGyldighetstidspunkt?: Maybe<Scalars['Date']>;
  kilde?: Maybe<Scalars['String']>;
  kode: Scalars['String'];
  master: Scalars['String'];
  tekst: Scalars['String'];
};

export enum KjoennType {
  Kvinne = 'KVINNE',
  Mann = 'MANN',
  Ukjent = 'UKJENT'
}

export type Kontaktadresse = {
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

export type Navn = {
  __typename?: 'Navn';
  etternavn: Scalars['String'];
  fornavn: Scalars['String'];
  mellomnavn?: Maybe<Scalars['String']>;
};

export type Oppholdsadresse = {
  __typename?: 'Oppholdsadresse';
  adresse: StrukturertAdresseformat;
  coAdressenavn?: Maybe<Scalars['String']>;
  erHistorisk: Scalars['Boolean'];
  gyldigFraOgMed?: Maybe<Scalars['Date']>;
  gyldigTilOgMed?: Maybe<Scalars['Date']>;
  kilde?: Maybe<Scalars['String']>;
  master: Scalars['String'];
};

export type Personopplysninger = {
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

export type Query = {
  __typename?: 'Query';
  hentPersonopplysninger: Personopplysninger;
  hentSaksopplysninger: Saksopplysninger;
};


export type QueryHentPersonopplysningerArgs = {
  ident: Scalars['String'];
};


export type QueryHentSaksopplysningerArgs = {
  behandlingID: Scalars['Long'];
};

export type Saksopplysninger = {
  __typename?: 'Saksopplysninger';
  behandlingID: Scalars['Long'];
  persondata: Personopplysninger;
};

export type SemistrukturertAdresseformat = {
  __typename?: 'SemistrukturertAdresseformat';
  adresselinje1?: Maybe<Scalars['String']>;
  adresselinje2?: Maybe<Scalars['String']>;
  adresselinje3?: Maybe<Scalars['String']>;
  adresselinje4?: Maybe<Scalars['String']>;
  land: Scalars['String'];
  postnummer?: Maybe<Scalars['String']>;
  poststed?: Maybe<Scalars['String']>;
};

export type Sivilstand = {
  __typename?: 'Sivilstand';
  bekreftelsesdato?: Maybe<Scalars['Date']>;
  erHistorisk: Scalars['Boolean'];
  gyldigFraOgMed?: Maybe<Scalars['Date']>;
  kilde?: Maybe<Scalars['String']>;
  master: Scalars['String'];
  relatertVedSivilstand?: Maybe<Scalars['String']>;
  type: Scalars['String'];
};

export type Statsborgerskap = {
  __typename?: 'Statsborgerskap';
  bekreftelsesdato?: Maybe<Scalars['Date']>;
  erHistorisk: Scalars['Boolean'];
  gyldigFraOgMed?: Maybe<Scalars['Date']>;
  gyldigTilOgMed?: Maybe<Scalars['Date']>;
  kilde?: Maybe<Scalars['String']>;
  land: Scalars['String'];
  master: Scalars['String'];
};

export type StrukturertAdresseformat = {
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
