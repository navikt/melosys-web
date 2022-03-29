export type Maybe<T> = T | null;
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
  /** Format: YYYY-MM-DD (ISO-8601), example: 2017-11-24 */
  Date: string;
  /** Custom scalar for Long */
  Long: number;
};

export type Bostedsadresse = {
  __typename?: 'Bostedsadresse';
  coAdressenavn?: Maybe<Scalars['String']>;
  adresse: StrukturertAdresseformat;
  gyldigFraOgMed?: Maybe<Scalars['Date']>;
  gyldigTilOgMed?: Maybe<Scalars['Date']>;
  master: Scalars['String'];
  kilde?: Maybe<Scalars['String']>;
  erHistorisk: Scalars['Boolean'];
};


export type Familiemedlem = {
  __typename?: 'Familiemedlem';
  navn: Scalars['String'];
  ident: Scalars['String'];
  relasjonsrolle: Familierelasjonsrolle;
  alder?: Maybe<Scalars['Int']>;
  foreldreansvar?: Maybe<Scalars['String']>;
  fnrAnnenForelder?: Maybe<Scalars['String']>;
  sivilstand?: Maybe<Scalars['String']>;
  erHistorisk?: Maybe<Scalars['Boolean']>;
  sivilstandGyldighetsperiodeFom?: Maybe<Scalars['Date']>;
};

export enum Familierelasjonsrolle {
  Barn = 'BARN',
  Far = 'FAR',
  Mor = 'MOR',
  RelatertVedSivilstand = 'RELATERT_VED_SIVILSTAND'
}

export type Folkeregisterpersonstatus = {
  __typename?: 'Folkeregisterpersonstatus';
  kode: Scalars['String'];
  tekst: Scalars['String'];
  master: Scalars['String'];
  kilde?: Maybe<Scalars['String']>;
  fregGyldighetstidspunkt?: Maybe<Scalars['Date']>;
  erHistorisk: Scalars['Boolean'];
};

export enum KjoennType {
  Kvinne = 'KVINNE',
  Mann = 'MANN',
  Ukjent = 'UKJENT'
}

export type Kontaktadresse = {
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


export type Navn = {
  __typename?: 'Navn';
  fornavn: Scalars['String'];
  mellomnavn?: Maybe<Scalars['String']>;
  etternavn: Scalars['String'];
};

export type Oppholdsadresse = {
  __typename?: 'Oppholdsadresse';
  coAdressenavn?: Maybe<Scalars['String']>;
  adresse: StrukturertAdresseformat;
  gyldigFraOgMed?: Maybe<Scalars['Date']>;
  gyldigTilOgMed?: Maybe<Scalars['Date']>;
  master: Scalars['String'];
  kilde?: Maybe<Scalars['String']>;
  erHistorisk: Scalars['Boolean'];
};

export type Personopplysninger = {
  __typename?: 'Personopplysninger';
  bostedsadresser: Array<Bostedsadresse>;
  familiemedlemmer: Array<Familiemedlem>;
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
  hentSaksopplysninger: Saksopplysninger;
  hentPersonopplysninger: Personopplysninger;
};


export type QueryHentSaksopplysningerArgs = {
  behandlingID: Scalars['Long'];
};


export type QueryHentPersonopplysningerArgs = {
  ident: Scalars['String'];
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
  postnummer?: Maybe<Scalars['String']>;
  poststed?: Maybe<Scalars['String']>;
  land: Scalars['String'];
};

export type Sivilstand = {
  __typename?: 'Sivilstand';
  type: Scalars['String'];
  relatertVedSivilstand?: Maybe<Scalars['String']>;
  gyldigFraOgMed?: Maybe<Scalars['Date']>;
  bekreftelsesdato?: Maybe<Scalars['Date']>;
  master: Scalars['String'];
  kilde?: Maybe<Scalars['String']>;
  erHistorisk: Scalars['Boolean'];
};

export type Statsborgerskap = {
  __typename?: 'Statsborgerskap';
  land: Scalars['String'];
  bekreftelsesdato?: Maybe<Scalars['Date']>;
  gyldigFraOgMed?: Maybe<Scalars['Date']>;
  gyldigTilOgMed?: Maybe<Scalars['Date']>;
  master: Scalars['String'];
  kilde?: Maybe<Scalars['String']>;
  erHistorisk: Scalars['Boolean'];
};

export type StrukturertAdresseformat = {
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
