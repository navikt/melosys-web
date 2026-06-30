import { deleteAsJson, getAsJson, putAsJson } from "../utils";
import { API_BASE_URL, TRYGDEAVGIFT, EØS_PENSJONIST } from "../api-constants";
import { KTObject } from "@navikt/melosys-kodeverk";
import { BasePeriode } from "./types/periodeTyper";

export interface InntektskildeDto extends BasePeriode {
  type: string;
  arbeidsgiversavgiftBetales: boolean;
  avgiftspliktigInntekt?: number;
  erMaanedsbelop: boolean;
}

export interface SkatteforholdDto extends BasePeriode {
  skatteplikttype: string;
}

export interface TrygdeavgiftsgrunnlagDto {
  skatteforholdsperioder: SkatteforholdDto[];
  inntektskilder: InntektskildeDto[];
}

export interface TrygdeavgiftMottakerDto {
  trygdeavgiftMottaker: KTObject;
}

export type Beregningsregel = "ORDINÆR" | "TJUEFEM_PROSENT_REGEL" | "MINSTEBELØP";

export type Beregningsregelgruppe = "SAMLET" | "HELSEDEL" | "PENSJONSDEL" | "MISJONAER";

export type BeregningsforklaringAarsak = "BEREGNET" | "INNTEKT_UNDER_MINSTEBELØP" | "INGEN_INNTEKT";

export interface Inntektspost {
  inntektskilde: string;
  fom: string;
  tom: string;
  maanedsbeloep: number;
  antallMaaneder: number;
  sumBeloep: number;
}

export interface EkskludertInntektspost {
  inntektskilde: string;
  fom: string;
  tom: string;
  sumBeloep: number;
  aarsak: string;
}

export interface OrdinaerAvgiftspost {
  inntektskilde: string;
  grunnlag: number;
  /** Prosentsats, f.eks. 7.7 for 7,7 %. */
  sats: number;
  beloep: number;
}

export interface Beregningsforklaring {
  aar: number;
  regelgruppe: Beregningsregelgruppe;
  valgtRegel: Beregningsregel;
  aarsak: BeregningsforklaringAarsak;
  inntektsgrunnlag: Inntektspost[];
  ekskluderteInntekter: EkskludertInntektspost[];
  sumAarligInntekt: number;
  minstebeloep: number;
  inntektOverMinstebeloep: number | null;
  maksimalAvgift25Prosent: number | null;
  ordinaerAvgift: number;
  ordinaerAvgiftPoster: OrdinaerAvgiftspost[];
  fastsattAvgift: number;
  fastsattAvgiftPerMaaned: number;
}

export interface Trygdeavgiftsperiode {
  fom: string;
  tom: string;
  trygdedekning: string;
  inntektskildetype: string;
  avgiftssats: number | null;
  avgiftPerMd: number;
  beregningsregel?: Beregningsregel | null;
  harSammenslåtteInntektskilder?: boolean;
  avgiftsdel?: string | null;
}

export interface BeregnetTrygdeavgift {
  trygdeavgiftsperioder: Trygdeavgiftsperiode[];
  trygdeavgiftsgrunnlag: TrygdeavgiftsgrunnlagDto;
  beregningsforklaringer?: Beregningsforklaring[];
}

export interface Fakturamottaker {
  navn: string;
}

export const hentTrygdeavgiftMottaker = (behandlingID: number): Promise<TrygdeavgiftMottakerDto> =>
  getAsJson(`${API_BASE_URL}behandlinger/${behandlingID}/${TRYGDEAVGIFT}/mottaker`);

export const hentTrygdeavgiftperioder = (behandlingID: number): Promise<Trygdeavgiftsperiode[]> =>
  getAsJson(`${API_BASE_URL}behandlinger/${behandlingID}/${TRYGDEAVGIFT}`);

export const beregnTrygdeavgiftsperioder = (
  behandlingID: number,
  trygdeavgiftsgrunnlag: TrygdeavgiftsgrunnlagDto,
): Promise<BeregnetTrygdeavgift> =>
  putAsJson(`${API_BASE_URL}behandlinger/${behandlingID}/${TRYGDEAVGIFT}/beregning`, trygdeavgiftsgrunnlag);

export const eøsPensjonistBeregnTrygdeavgiftsperioder = (
  behandlingID: number,
  trygdeavgiftsgrunnlag: TrygdeavgiftsgrunnlagDto,
): Promise<BeregnetTrygdeavgift> =>
  putAsJson(
    `${API_BASE_URL}behandlinger/${behandlingID}/${TRYGDEAVGIFT}/${EØS_PENSJONIST}/beregning`,
    trygdeavgiftsgrunnlag,
  );

export const hentBeregnetTrygdeavgift = (behandlingID: number): Promise<BeregnetTrygdeavgift> =>
  getAsJson(`${API_BASE_URL}behandlinger/${behandlingID}/${TRYGDEAVGIFT}/beregning`);

export const hentBeregnetTrygdeavgiftEosPensjonist = (behandlingID: number): Promise<BeregnetTrygdeavgift> =>
  getAsJson(`${API_BASE_URL}behandlinger/${behandlingID}/${TRYGDEAVGIFT}/eos-pensjonist/beregning`);

export const hentOpprinneligTrygdeavgiftsgrunnlag = (behandlingID: number): Promise<TrygdeavgiftsgrunnlagDto> =>
  getAsJson(`${API_BASE_URL}behandlinger/${behandlingID}/${TRYGDEAVGIFT}/grunnlag/opprinnelig`);

export const hentFakturamottaker = (behandlingID: number): Promise<Fakturamottaker> =>
  getAsJson(`${API_BASE_URL}behandlinger/${behandlingID}/${TRYGDEAVGIFT}/fakturamottaker`);

export const slettTrygdeavgiftsperioder = (behandlingID: number): Promise<null> =>
  deleteAsJson(`${API_BASE_URL}behandlinger/${behandlingID}/${TRYGDEAVGIFT}`);
