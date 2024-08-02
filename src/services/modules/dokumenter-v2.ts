import { KTObject } from "@navikt/melosys-kodeverk";
import { getAsJson, postAsJson, postAsJsonReceiveAsPDF } from "../utils";
import { API_BASE_URL, DOKUMENTER } from "../api-constants";

export type BrevAdresse = {
  mottakerNavn: string;
  orgnr: string | null;
  adresselinjer: string[];
  postnr: string;
  poststed: string;
  region: string;
  land: string;
  ugyldig: boolean;
};

export enum ValgType {
  CHECKBOX = "CHECKBOX",
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
  FORMTITTEL = "FORMTITTEL",
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

export type FeilmeldingProps = {
  tittel: string;
  underpunkter?: Underpunkt[];
};

export type Underpunkt = {
  underpunkt: string;
};

export type TilgjengeligMottaker = {
  uuid: string;
  type: string;
  rolle: string;
  adresser: BrevAdresse[] | null;
  feilmelding: FeilmeldingProps | undefined;
  trygdemyndighet: string[] | null;
};

export type TilgjengeligMal = {
  mottaker: TilgjengeligMottaker;
  brevTyper: TilgjengeligBrev[];
};

export type TilgjengeligNorskMyndighet = {
  navn: string;
  orgnr: string;
};

export type TilgjengeligBrev = {
  type: KTObject;
  tittel: string | null;
  felter: Felt[] | null;
};
export type TilgjengeligeMalerResDto = TilgjengeligMal[];

export type TilgjengeligeNorskeMyndigheterResDto = TilgjengeligNorskMyndighet[];

export type KopiMottaker = {
  rolle: string;
  orgnr: string | null;
  aktørId: string;
  institusjonID: string | null;
};

export type Saksvedlegg = {
  dokumentID: string;
  journalpostID: string;
};

export type OpprettBrevReqDto = {
  produserbardokument: string;
  mottaker: string;
  orgNr?: string | null;
  orgnrNorskMyndighet?: string[];
  innledningFritekst?: string | null;
  begrunnelseFritekst?: string | null;
  trygdeavgiftFritekst?: string | null;
  manglerFritekst?: string | null;
  fritekstTittel?: string | null;
  fritekst?: string | null;
  kontaktpersonNavn?: string | null;
  kopiMottakere?: KopiMottaker[];
  kontaktopplysninger?: boolean | null;
  saksvedlegg?: Saksvedlegg[];
  fritekstvedlegg?: {
    tittel: string;
    fritekst: string;
  }[];
  nyVurderingBakgrunn?: string | null;
  distribusjonstype?: string | null;
  dokumentTittel?: string | null;
  saksbehandlerNrToIdent?: string | null;
  skalViseStandardTekstOmOpplysninger?: boolean | false;
  begrunnelseKode?: string | null;
  ytterligereInformasjon?: string | null;
  opphoerDato?: string | null;
  institusjonID?: string | null;
};

export type MuligMottaker = {
  mottakerNavn: string;
  dokumentNavn: string;
  rolle: string;
  orgnr: string | null;
  aktørId: string | null;
  institusjonID: string | null;
};

export const konverterMuligMottakerTilKopiMottaker = (muligMottaker: MuligMottaker): KopiMottaker => ({
  rolle: muligMottaker.rolle,
  orgnr: muligMottaker.orgnr,
  aktørId: muligMottaker.aktørId || "",
  institusjonID: muligMottaker.institusjonID,
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
    institusjonID: null,
  },
  kopiMottakere: [],
  fasteMottakere: [],
});

export type HentMuligeMottakereReqDto = {
  produserbartdokument: string;
  orgnr: string | null;
  institusjonID?: string | null;
};

export type HentMuligeMottakereNorskMyndighetReqDto = {
  produserbartdokument: string;
  orgnrNorskMyndighet: string[];
};

export const hentTilgjengeligeMaler = (behandlingID: number): Promise<TilgjengeligeMalerResDto> =>
  getAsJson(`${API_BASE_URL}${DOKUMENTER}/v2/tilgjengelige-maler/${behandlingID}`);

export const hentTilgjengeligeNorskeMyndigheter = (): Promise<TilgjengeligeNorskeMyndigheterResDto> =>
  getAsJson(`${API_BASE_URL}${DOKUMENTER}/v2/tilgjengelige-norske-myndigheter`);

export const hentMuligeMottakere = (
  behandlingID: number,
  data: HentMuligeMottakereReqDto
): Promise<HentMuligeMottakereResDto> =>
  postAsJson(`${API_BASE_URL}${DOKUMENTER}/v2/mulige-mottakere/${behandlingID}`, data);

export const hentMuligeMottakereNorskMyndighet = (
  behandlingID: number,
  data: HentMuligeMottakereNorskMyndighetReqDto
): Promise<MuligMottaker[]> =>
  postAsJson(`${API_BASE_URL}${DOKUMENTER}/v2/mulige-mottakere-norske-myndigheter/${behandlingID}`, data);

export const opprettBrev = (behandlingID: number, data: OpprettBrevReqDto) =>
  postAsJson(`${API_BASE_URL}${DOKUMENTER}/v2/opprett/${behandlingID}`, data);

export const opprettUtkastBrev = (behandlingID: number, data: OpprettBrevReqDto) =>
  postAsJsonReceiveAsPDF(`${API_BASE_URL}${DOKUMENTER}/v2/pdf/brev/utkast/${behandlingID}`, data, true);
