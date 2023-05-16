import { getAsJson, putAsJson } from "../utils";
import { API_BASE_URL, TRYGDEAVGIFT } from "../api-constants";

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
