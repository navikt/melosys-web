import { KTObject } from "@navikt/melosys-kodeverk";
import { getAsJson, postAsJson, postAsJsonReceiveAsPDF } from "../utils";
import { API_BASE_URL, DOKUMENTER } from "../api-constants";

export type MottakerAdresse = {
  tittel: {
    mottakerNavn: string;
    orgnr: string | null;
  };
  adresselinjer: string[];
  postnr: string;
  poststed: string;
  region: string;
  land: string;
};

export enum ValgType {
  RADIO = "RADIO",
  SELECT = "SELECT",
}

export interface ValgAlternativ {
  kode: string;
  beskrivelse: string;
  visFelt: boolean;
}

export interface Valg {
  valgType: ValgType;
  valgAlternativer: ValgAlternativ[];
}

export enum FeltType {
  TEKST = "TEKST",
  FRITEKST = "FRITEKST",
  SJEKKBOKS = "SJEKKBOKS",
  VEDLEGG = "VEDLEGG",
  FRITEKSTVEDLEGG = "FRITEKSTVEDLEGG",
}

export interface Felt {
  kode: string;
  beskrivelse: string;
  feltType: FeltType;
  hjelpetekst: string | null;
  paakrevd: boolean;
  tegnBegrensning: number | null;
  valg: null | Valg;
}

export type TilgjengeligMottaker = {
  uuid: string;
  type: string;
  rolle: string;
  orgnrSettesAvSaksbehandler: boolean;
  adresser: MottakerAdresse[] | null;
  feilmelding: string | null;
  trygdemyndighet: string[] | null;
};

export type TilgjengeligMal = {
  mottaker: TilgjengeligMottaker;
  brevTyper: TilgjengeligBrev[];
};

export type TilgjengeligBrev = {
  type: KTObject;
  felter: Felt[] | null;
};
export type TilgjengeligeMalerResDto = TilgjengeligMal[];

export type KopiMottaker = {
  rolle: string;
  orgnr: string | null;
  aktørId: string;
  institusjonId: string | null;
};

export type OpprettBrevReqDto = {
  produserbardokument: string;
  mottaker: string;
  orgNr?: string;
  innledningFritekst?: string;
  begrunnelseFritekst?: string;
  manglerFritekst?: string;
  fritekstTittel?: string;
  fritekst?: string;
  kontaktpersonNavn?: string | null;
  kopiMottakere: KopiMottaker[];
  kontaktopplysninger: boolean | null;
  saksvedlegg: {
    dokumentID: string;
    journalpostID: string;
  }[];
  fritekstvedlegg: {
    tittel: string;
    fritekst: string;
  }[];
  distribusjonstype?: string;
};

export type MuligMottaker = {
  mottakerNavn: string;
  dokumentNavn: string;
  rolle: string;
  orgnr: string | null;
  aktørId: string | null;
  institusjonId: string | null;
};

export const konverterMuligMottakerTilKopiMottaker = (muligMottaker: MuligMottaker): KopiMottaker => ({
  rolle: muligMottaker.rolle,
  orgnr: muligMottaker.orgnr,
  aktørId: muligMottaker.aktørId || "",
  institusjonId: muligMottaker.institusjonId,
});

export type HentMuligeMottakereResDto = {
  hovedMottaker: MuligMottaker;
  kopiMottakere: MuligMottaker[];
  fasteMottakere: MuligMottaker[];
};

export const tomHentMuligeMottakereResDto = (): HentMuligeMottakereResDto => ({
  hovedMottaker: {
    mottakerNavn: "",
    dokumentNavn: "",
    rolle: "",
    orgnr: null,
    aktørId: null,
    institusjonId: null,
  },
  kopiMottakere: [],
  fasteMottakere: [],
});

export type HentMuligeMottakereReqDto = {
  produserbartdokument: string;
  orgnr: string | null;
};

export const hentTilgjengeligeMaler = (behandlingID: number): Promise<TilgjengeligeMalerResDto> =>
  getAsJson(`${API_BASE_URL}${DOKUMENTER}/v2/tilgjengelige-maler/${behandlingID}`);

export const hentMuligeMottakere = (
  behandlingID: number,
  data: HentMuligeMottakereReqDto
): Promise<HentMuligeMottakereResDto> =>
  postAsJson(`${API_BASE_URL}${DOKUMENTER}/v2/mulige-mottakere/${behandlingID}`, data);

export const opprettBrev = (behandlingID: number, data: OpprettBrevReqDto) =>
  postAsJson(`${API_BASE_URL}${DOKUMENTER}/v2/opprett/${behandlingID}`, data);

export const opprettUtkastBrev = (behandlingID: number, data: OpprettBrevReqDto) =>
  postAsJsonReceiveAsPDF(`${API_BASE_URL}${DOKUMENTER}/v2/pdf/brev/utkast/${behandlingID}`, data, true);
