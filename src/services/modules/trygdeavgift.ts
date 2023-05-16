import { Avgiftsberegning, Avgiftsgrunnlag, AvgiftsgrunnlagInfo } from "./types";
import { getAsJson, putAsJson } from "../utils";
import { API_BASE_URL, TRYGDEAVGIFT } from "../api-constants";

export type OppdaterAvgiftsgrunnlag = {
  lønnsforhold: string | null;
  trygdeavgiftsgrunnlagNorge: AvgiftsgrunnlagInfo | null;
  trygdeavgiftsgrunnlagUtland: AvgiftsgrunnlagInfo | null;
};

export type OppdaterAvgiftsberegning = {
  avgiftspliktigLønnNorge: number | null;
  avgiftspliktigLønnUtland: number | null;
};

export const hentBeregning = (behandlingID: number): Promise<Avgiftsberegning> =>
  getAsJson(`${API_BASE_URL}/behandlinger/${behandlingID}/${TRYGDEAVGIFT}/beregning`);

export const sendBeregning = (behandlingID: number, beregning: OppdaterAvgiftsberegning): Promise<Avgiftsberegning> =>
  putAsJson(`${API_BASE_URL}/behandlinger/${behandlingID}/${TRYGDEAVGIFT}/beregning`, beregning);

export const hentGrunnlag = (behandlingID: number): Promise<Avgiftsgrunnlag> =>
  getAsJson(`${API_BASE_URL}/behandlinger/${behandlingID}/${TRYGDEAVGIFT}/grunnlag`);

export const sendGrunnlag = (behandlingID: number, grunnlag: OppdaterAvgiftsgrunnlag): Promise<Avgiftsgrunnlag> =>
  putAsJson(`${API_BASE_URL}/behandlinger/${behandlingID}/${TRYGDEAVGIFT}/grunnlag`, grunnlag);

export type Inntektskilde = {
  type: string;
  arbeidsgiversavgiftBetales: boolean;
  avgiftspliktigInntektMnd?: number;
};

export type TrygdeavgiftsgrunnlagDto = {
  skatteplikttype: string;
  inntektskilder: Inntektskilde[];
};

export const hentTrygdeavgiftsgrunnlaget = (behandlingID: number): Promise<TrygdeavgiftsgrunnlagDto> =>
  getAsJson(`${API_BASE_URL}/behandlinger/${behandlingID}/${TRYGDEAVGIFT}/grunnlag`);

export const oppdaterTrygdeavgiftsgrunnlag = (
  behandlingID: number,
  grunnlag: TrygdeavgiftsgrunnlagDto
): Promise<TrygdeavgiftsgrunnlagDto> =>
  putAsJson(`${API_BASE_URL}/behandlinger/${behandlingID}/${TRYGDEAVGIFT}/grunnlag`, grunnlag);

export type Trygdeavgiftsperiode = {
  fom: string;
  tom: string;
  trygdedekning: string;
  inntektskildetype: string;
  avgiftssats: number;
  avgiftPerMd: number;
};

export type BeregnetTrygdeavgift = {
  trygdeavgiftsperioder: Trygdeavgiftsperiode[];
};

export const hentBeregnetTrygdeavgift = (behandlingID: number): Promise<BeregnetTrygdeavgift> =>
  getAsJson(`${API_BASE_URL}/behandlinger/${behandlingID}/${TRYGDEAVGIFT}/beregning`);

export const beregnTrygdeavgift = (behandlingID: number): Promise<BeregnetTrygdeavgift> =>
  putAsJson(`${API_BASE_URL}/behandlinger/${behandlingID}/${TRYGDEAVGIFT}/beregning`);
