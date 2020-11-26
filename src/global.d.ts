/* eslint-disable no-undef */

declare module 'AppTypes' {
  export type RootState = ReturnType<ReturnType<typeof import('./reducer').default>>;
  export type AppThunk<ReturnType = void, ActionType> = import('redux-thunk').ThunkAction<ReturnType, RootState, unknown, ActionType>;

  export interface StateSection<TData> {
    status: string;
    data: TData;
  }
}

declare module 'Domene' {
  export type StrukturertAdresse = import('./@types').StrukturertAdresse;
  export type Aktoer = import('./@types').Aktoer;
  export type Avklartfakta = import('./@types').Avklartfakta;
  export type AnmodningOmUnntakBestilling = import('./@types').AnmodningOmUnntakBestilling;
  export type Fagsak = import('./@types').Fagsak;
  export type GeneriskAdresse = import('./@types').GeneriskAdresse;
  export type MedlemskapsPeriode = import('./@types').MedlemskapPeriode;
  export type Oppsummering = import('./@types').Oppsummering;
  export type Periode = import('./@types').Periode;
  export type Person = import('./@types').Person;
  export type PersonHistorikk = import('./@types').PersonHistorikk;
  export type OppsummertFaktaVirksomheter = import('./@types').Virksomheter;
  export type Organisasjon = import('./@types').Organisasjon;
  export type Videresending = import('./@types').Videresending;
  export type DokumentOversikt = import('./@types').DokumentOversikt;
  export type Dokument = import('./@types').Dokument;
  export type FysiskDokument = import('./@types').FysiskDokument;
  export type Mottaksretning = import('./@types').Mottaksretning;
  export type BrevPdfData = import('./@types').BrevPdfData;
  export type SedPdfData = import('./@types').SedPdfData;
  export type Familiemedlem = import('./@types').Familiemedlem;
}

declare module '@navikt/melosys-kodeverk' {
  export type KTObject = { kode: string, term: string | null };
}

declare module 'melosys-api' {
  interface Feilkode {
    kode: string,
    felter: string[],
  }

  export interface ErrorResponse {
    error: string,
    status: number,
    message: string,
    feilkoder?: Feilkode[],
  }
}
