import { fakturaserierTypes } from "./index";

export const OK = "fakturaserier/OK";
export const FEILET = "fakturaserier/FEILET";
export const PENDING = "fakturaserier/PENDING";
export const RESET = "fakturaserier/RESET";

enum Innbetalingstype {
  TRYGDEAVGIFT,
}

enum FakturaserieStatus {
  OPPRETTET,
  UNDER_BESTILLING,
  KANSELLERT,
  ERSTATTET,
  FERDIG,
}

enum FakturaserieIntervall {
  MANEDLIG,
  KVARTAL,
}
export enum FakturaStatus {
  OPPRETTET = "OPPRETTET",
  BESTILT = "BESTILT",
  KANSELLERT = "KANSELLERT",
  BETALT = "BETALT",
  DELVIS_BETALT = "DELVIS_BETALT",
  FEIL = "FEIL",
  INNE_I_OEBS = "INNE_I_OEBS",
  MANGLENDE_INNBETALING = "MANGLENDE_INNBETALING",
}

export interface Fakturaserie {
  fakturaserieReferanse: string;
  fakturaGjelderInnbetalingstype: Innbetalingstype;
  fodselsnummer: string;
  fullmektig?: Fullmektig;
  referanseBruker: string;
  referanseNAV: string;
  startDato: string;
  sluttDato: string;
  status: FakturaserieStatus;
  intervall: FakturaserieIntervall;
  opprettetTidspunkt: string;
  faktura: Faktura[];
}

interface Fullmektig {
  fodselsnummer?: string;
  organisasjonsnummer?: string;
}

export interface Faktura {
  fakturaReferanse: string;
  datoBestilt: string;
  sistOppdatert: string;
  status: FakturaStatus;
  fakturaLinje: FakturaLinje[];
  periodeFra: string;
  periodeTil: string;
  eksternFakturaStatus: FakturaTilbakemelding[];
  eksternFakturaNummer?: string;
}

export interface FakturaLinje {
  periodeFra: string;
  periodeTil: string;
  beskrivelse: string;
  belop: number;
  antall: number;
  enhetsprisPerManed: number;
}

export interface FakturaTilbakemelding {
  dato: string;
  status: fakturaserierTypes.FakturaStatus;
  fakturaBelop?: number;
  ubetaltBelop?: number;
  feilmelding?: string;
}

interface FeiletAction {
  type: typeof FEILET;
  data: any;
}

interface PendingAction {
  type: typeof PENDING;
}

interface OkAction {
  type: typeof OK;
  data: any;
}

interface ResetAction {
  type: typeof RESET;
}

export type Action = FeiletAction | PendingAction | OkAction | ResetAction;
