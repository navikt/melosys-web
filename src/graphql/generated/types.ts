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
  /** Format: YYYY-MM-DDTHH:mm:SS (ISO-8601), example: 2011-12-03T10:15:30 */
  DateTime: string;
  /** Custom scalar for Long */
  Long: number;
};

export type Bostedsadresse = {
  __typename?: 'Bostedsadresse';
  coAdressenavn?: Maybe<Scalars['String']>;
  adresse: StrukturertAdresseformat;
  gyldigFraOgMed?: Maybe<Scalars['DateTime']>;
  gyldigTilOgMed?: Maybe<Scalars['DateTime']>;
  master: Scalars['String'];
  kilde?: Maybe<Scalars['String']>;
  erHistorisk: Scalars['Boolean'];
};



export type Kontaktadresse = {
  __typename?: 'Kontaktadresse';
  coAdressenavn?: Maybe<Scalars['String']>;
  semistrukturertAdresse?: Maybe<SemistrukturertAdresseformat>;
  strukturertAdresse?: Maybe<StrukturertAdresseformat>;
  gyldigFraOgMed?: Maybe<Scalars['DateTime']>;
  gyldigTilOgMed?: Maybe<Scalars['DateTime']>;
  master: Scalars['String'];
  kilde?: Maybe<Scalars['String']>;
  erHistorisk: Scalars['Boolean'];
};


export type Oppholdsadresse = {
  __typename?: 'Oppholdsadresse';
  coAdressenavn?: Maybe<Scalars['String']>;
  adresse: StrukturertAdresseformat;
  gyldigFraOgMed?: Maybe<Scalars['DateTime']>;
  gyldigTilOgMed?: Maybe<Scalars['DateTime']>;
  master: Scalars['String'];
  kilde?: Maybe<Scalars['String']>;
  erHistorisk: Scalars['Boolean'];
};

export type Personopplysninger = {
  __typename?: 'Personopplysninger';
  bostedsadresser: Array<Bostedsadresse>;
  kontaktadresser: Array<Kontaktadresse>;
  oppholdsadresser: Array<Oppholdsadresse>;
  statsborgerskap: Array<Statsborgerskap>;
};

export type Query = {
  __typename?: 'Query';
  hentSaksopplysninger: Saksopplysninger;
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
  postnummer?: Maybe<Scalars['String']>;
  poststed?: Maybe<Scalars['String']>;
  land: Scalars['String'];
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
