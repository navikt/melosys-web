import { deleteAsJson, getAsJson, putAsJson } from "../utils";
import { API_BASE_URL, TRYGDEAVGIFT, EØS_PENSJONIST } from "../api-constants";
import { KTObject } from "@navikt/melosys-kodeverk";
import { BasePeriode } from "./types/periodeTyper";

export interface InntektskildeDto extends Pick<BasePeriode, "fomDato" | "tomDato"> {
  type: string;
  arbeidsgiversavgiftBetales: boolean;
  avgiftspliktigInntekt?: number;
  erMaanedsbelop: boolean;
}

export interface SkatteforholdDto extends Pick<BasePeriode, "fomDato" | "tomDato"> {
  skatteplikttype: string;
}

export interface TrygdeavgiftsgrunnlagDto {
  skatteforholdsperioder: SkatteforholdDto[];
  inntektskilder: InntektskildeDto[];
}

export interface TrygdeavgiftMottakerDto {
  trygdeavgiftMottaker: KTObject;
}

export interface Trygdeavgiftsperiode {
  fom: string;
  tom: string;
  trygdedekning: string;
  inntektskildetype: string;
  avgiftssats: number;
  avgiftPerMd: number;
}

export interface BeregnetTrygdeavgift {
  trygdeavgiftsperioder: Trygdeavgiftsperiode[];
  trygdeavgiftsgrunnlag: TrygdeavgiftsgrunnlagDto;
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
