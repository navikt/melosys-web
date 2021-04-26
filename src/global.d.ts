/* eslint-disable no-undef */

declare module "AppTypes" {
  export type RootState = ReturnType<ReturnType<typeof import("./reducer").default>>;
  export type AppThunk<ReturnType = void, ActionType> = import("redux-thunk").ThunkAction<
    ReturnType,
    RootState,
    unknown,
    ActionType
  >;

  export interface StateSection<TData> {
    status: string;
    data: TData;
  }
}

declare module "Domene" {
  export type StrukturertAdresse = import("./@types").StrukturertAdresse;
  export type Aktoer = import("./@types").Aktoer;
  export type Avklartfakta = import("./@types").Avklartfakta;
  export type Fagsak = import("./@types").Fagsak;
  export type GeneriskAdresse = import("./@types").GeneriskAdresse;
  export type MedlPeriode = import("./@types").MedlPeriode;
  export type Periode = import("./@types").Periode;
  export type Person = import("./@types").Person;
  export type OppsummertFaktaVirksomheter = import("./@types").Virksomheter;
  export type OppsummertFaktaMedfolgendeFamilie = import("./@types").MedfolgendeFamilie;
  export type MedfolgendeFamiliemedlem = import("./@types").MedfolgendeFamiliemedlem;
  export type Organisasjon = import("./@types").Organisasjon;
  export type DokumentOversikt = import("./@types").DokumentOversikt;
  export type Dokument = import("./@types").Dokument;
  export type FysiskDokument = import("./@types").FysiskDokument;
  export type Mottaksretning = import("./@types").Mottaksretning;
  export type BrevPdfData = import("./@types").BrevPdfData;
  export type SedPdfData = import("./@types").SedPdfData;
  export type Medlemskapsperiode = import("./@types").Medlemskapsperiode;
  export type OppdaterMedlemskapsperiode = import("./@types").OppdaterMedlemskapsperiode;
  export type Familiemedlem = import("./@types").Familiemedlem;
  export type Avgiftsgrunnlag = import("./@types").Avgiftsgrunnlag;
  export type Avgiftsberegning = import("./@types").Avgiftsberegning;
  export type Avgiftsperiode = import("./@types").Avgiftsperiode;
  export type AvgiftsgrunnlagInfo = import("./@types").AvgiftsgrunnlagInfo;
}

declare module "@navikt/melosys-kodeverk" {
  export type KTObject = { kode: string; term: string | null };
}

declare module "melosys-api" {
  interface Feilkode {
    kode: string;
    felter: string[];
  }

  export interface ErrorResponse {
    error: string;
    status: number;
    message: string;
    feilkoder?: Feilkode[];
  }
}

declare module "objectpath" {
  interface Objectpath {
    parse: (path: string) => string[];
    stringify: (tokens: string[]) => string;
  }

  declare const objectpath: Objectpath;
  export default objectpath;
}
