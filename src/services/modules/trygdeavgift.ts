import { deleteAsJson, getAsJson, putAsJson } from "../utils";
import { API_BASE_URL, TRYGDEAVGIFT } from "../api-constants";
import { KTObject } from "@navikt/melosys-kodeverk";

export interface InntektskildeDto {
  type: string;
  arbeidsgiversavgiftBetales: boolean;
  avgiftspliktigInntekt?: number;
  fomDato: string;
  tomDato: string;
  erMaanedsbelop: boolean;
}

export interface SkatteforholdDto {
  fomDato: string;
  tomDato: string;
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
  getAsJson(`${API_BASE_URL}/behandlinger/${behandlingID}/${TRYGDEAVGIFT}/mottaker`);

export const beregnTrygdeavgiftsperioder = (
  behandlingID: number,
  trygdeavgiftsgrunnlag: TrygdeavgiftsgrunnlagDto,
): Promise<BeregnetTrygdeavgift> =>
  putAsJson(`${API_BASE_URL}/behandlinger/${behandlingID}/${TRYGDEAVGIFT}/beregning`, trygdeavgiftsgrunnlag);

export const hentBeregnetTrygdeavgift = (behandlingID: number): Promise<BeregnetTrygdeavgift> =>
  getAsJson(`${API_BASE_URL}/behandlinger/${behandlingID}/${TRYGDEAVGIFT}/beregning`);

export const hentOpprinneligTrygdeavgiftsgrunnlag = (behandlingID: number): Promise<TrygdeavgiftsgrunnlagDto> =>
  getAsJson(`${API_BASE_URL}/behandlinger/${behandlingID}/${TRYGDEAVGIFT}/grunnlag/opprinnelig`);

export const hentFakturamottaker = (behandlingID: number): Promise<Fakturamottaker> =>
  getAsJson(`${API_BASE_URL}/behandlinger/${behandlingID}/${TRYGDEAVGIFT}/fakturamottaker`);

export const slettTrygdeavgiftsperioder = (behandlingID: number): Promise<null> =>
  deleteAsJson(`${API_BASE_URL}/behandlinger/${behandlingID}/${TRYGDEAVGIFT}`);
