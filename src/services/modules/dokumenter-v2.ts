import { KTObject } from "@navikt/melosys-kodeverk";
import { getAsJson, postAsJson, postAsJsonReceiveAsPDF } from "../utils";
import { API_BASE_URL, DOKUMENTER } from "../api-constants";
import { Mottaksretning } from "../../@types";

export interface Dokument {
  dokumentID: string;
  tittel: string;
  logiskeVedlegg: string[];
}

export interface FysiskDokument extends Dokument {
  id: string;
  journalpostID: string;
  dato: string | null;
  avsenderEllerMottaker: string;
}

export interface DokumentOversikt {
  journalforingDato: string | null;
  avsenderEllerMottaker: string;
  journalpostID: string;
  mottaksretning: Mottaksretning;
  mottattDato: string | null;
  hoveddokument: Dokument;
  vedlegg: Dokument[];
}

export interface SedPdfData {
  begrunnelseUtenlandskMyndighet?: string | null;
  vilSendeAnmodningOmMerInformasjon?: boolean | null;
  nyttLovvalgsland?: string | null;
  fritekst?: string | null;
  a008Formaal?: string | null; // CDM 4.4: "endringsmelding" | "arbeid_flere_land"
  erFjernarbeidTWFA?: boolean | null;
}

// TODO: Bedre navn?
export interface BrevVedleggInterface {
  saksvedlegg: FysiskDokument[];
  standardvedlegg: TilgjengeligStandardvedlegg | null;
}

export interface BrevVedleggVisningstabellInterface {
  saksvedlegg: FysiskDokument[];
  standardvedlegg: TilgjengeligStandardvedlegg[];
}

export interface BrevAdresse {
  mottakerNavn: string;
  orgnr: string | null;
  adresselinjer: string[];
  postnr: string;
  poststed: string;
  region: string;
  land: string;
  ugyldig: boolean;
}

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

export interface FeilmeldingProps {
  tittel: string;
  underpunkter?: Underpunkt[];
}

export interface Underpunkt {
  underpunkt: string;
}

export interface TilgjengeligMottaker {
  uuid: string;
  type: string;
  rolle: string;
  adresser: BrevAdresse[] | null;
  feilmelding: FeilmeldingProps | undefined;
  trygdemyndighet: string[] | null;
}

export interface TilgjengeligMal {
  mottaker: TilgjengeligMottaker;
  brevTyper: TilgjengeligBrev[];
}

// TODO: Skal vi ha frontendtittel her eller?
export enum StandardvedleggType {
  VIKTIG_INFORMASJON_RETTIGHETER_PLIKTER_AVSLAG = "info_om_rettigheter_avslag",
  VIKTIG_INFORMASJON_RETTIGHETER_PLIKTER_INNVILGELSE = "info_om_rettigheter_innvilgelse",
}

// TODO: Rename til "Standardvedlegg"?
export interface TilgjengeligStandardvedlegg {
  type: StandardvedleggType;
  frontendTittel: string;
  dokumentTittel: string;
}

export interface TilgjengeligNorskMyndighet {
  navn: string;
  orgnr: string;
}

export interface TilgjengeligBrev {
  type: KTObject;
  felter: Felt[] | null;
}
export type TilgjengeligeMalerResDto = TilgjengeligMal[];

export type TilgjengeligeNorskeMyndigheterResDto = TilgjengeligNorskMyndighet[];

export type TilgjengeligeStandardvedleggResDto = TilgjengeligStandardvedlegg[];

export interface KopiMottaker {
  rolle: string;
  orgnr: string | null;
  aktørId: string;
  institusjonID: string | null;
}

export interface Saksvedlegg {
  dokumentID: string;
  journalpostID: string;
}

export interface OpprettBrevReqDto {
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
  skalViseStandardTekstOmkontaktopplysninger?: boolean | null;
  saksvedlegg?: Saksvedlegg[];
  standardvedleggType?: StandardvedleggType | null;
  fritekstvedlegg?: {
    tittel: string;
    fritekst: string;
  }[];
  nyVurderingBakgrunn?: string | null;
  distribusjonstype?: string | null;
  dokumentTittel?: string | null;
  saksbehandlerNrToIdent?: string | null;
  begrunnelseKode?: string | null;
  ytterligereInformasjon?: string | null;
  opphoerDato?: string | null;
  institusjonID?: string | null;
  erInnvilgelse?: boolean | null;
}

export interface MuligMottaker {
  mottakerNavn: string;
  dokumentNavn: string;
  rolle: string;
  orgnr: string | null;
  aktørId: string | null;
  institusjonID: string | null;
}

export const konverterMuligMottakerTilKopiMottaker = (muligMottaker: MuligMottaker): KopiMottaker => ({
  rolle: muligMottaker.rolle,
  orgnr: muligMottaker.orgnr,
  aktørId: muligMottaker.aktørId || "",
  institusjonID: muligMottaker.institusjonID,
});

export interface HentMuligeMottakereResDto {
  hovedMottaker: MuligMottaker;
  kopiMottakere: MuligMottaker[];
  fasteMottakere: MuligMottaker[];
}

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

export interface HentMuligeMottakereReqDto {
  produserbartdokument: string;
  orgnr: string | null;
  institusjonID?: string | null;
}

export interface HentMuligeMottakereNorskMyndighetReqDto {
  produserbartdokument: string;
  orgnrNorskMyndighet: string[];
}

export const hentTilgjengeligeMaler = (behandlingID: number): Promise<TilgjengeligeMalerResDto> =>
  getAsJson(`${API_BASE_URL}${DOKUMENTER}/v2/tilgjengelige-maler/${behandlingID}`);

export const hentTilgjengeligeStandardvedlegg = (): Promise<TilgjengeligeStandardvedleggResDto> =>
  getAsJson(`${API_BASE_URL}${DOKUMENTER}/v2/standardvedlegg`);

export const hentStandardvedleggForBrev = (produserbartdokument: string) =>
  getAsJson(`${API_BASE_URL}${DOKUMENTER}/v2/standardvedlegg/${produserbartdokument}`);

export const hentTilgjengeligeNorskeMyndigheter = (): Promise<TilgjengeligeNorskeMyndigheterResDto> =>
  getAsJson(`${API_BASE_URL}${DOKUMENTER}/v2/tilgjengelige-norske-myndigheter`);

export const hentMuligeMottakere = (
  behandlingID: number,
  data: HentMuligeMottakereReqDto,
): Promise<HentMuligeMottakereResDto> =>
  postAsJson(`${API_BASE_URL}${DOKUMENTER}/v2/mulige-mottakere/${behandlingID}`, data);

export const hentMuligeMottakereNorskMyndighet = (
  behandlingID: number,
  data: HentMuligeMottakereNorskMyndighetReqDto,
): Promise<MuligMottaker[]> =>
  postAsJson(`${API_BASE_URL}${DOKUMENTER}/v2/mulige-mottakere-norske-myndigheter/${behandlingID}`, data);

export const opprettBrev = (behandlingID: number, data: OpprettBrevReqDto) =>
  postAsJson(`${API_BASE_URL}${DOKUMENTER}/v2/opprett/${behandlingID}`, data);

export const opprettUtkastBrev = (behandlingID: number, data: OpprettBrevReqDto) =>
  postAsJsonReceiveAsPDF(`${API_BASE_URL}${DOKUMENTER}/v2/pdf/brev/utkast/${behandlingID}`, data, true);
