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




export type Personopplysninger = {
  __typename?: 'Personopplysninger';
  statsborgerskap: Array<Statsborgerskap>;
};

export type Query = {
  __typename?: 'Query';
  hentSaksopplysninger?: Maybe<Saksopplysninger>;
};


export type QueryHentSaksopplysningerArgs = {
  behandlingID: Scalars['Long'];
};

export type Saksopplysninger = {
  __typename?: 'Saksopplysninger';
  behandlingID: Scalars['Long'];
  persondata?: Maybe<Personopplysninger>;
};

export type Statsborgerskap = {
  __typename?: 'Statsborgerskap';
  land: Scalars['String'];
  bekreftelsesdato?: Maybe<Scalars['Date']>;
  gyldigFraOgMed?: Maybe<Scalars['Date']>;
  gyldigTilOgMed?: Maybe<Scalars['Date']>;
  master?: Maybe<Scalars['String']>;
  kilde?: Maybe<Scalars['String']>;
  erHistorisk?: Maybe<Scalars['Boolean']>;
};
