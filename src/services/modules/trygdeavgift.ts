import { Avgiftsberegning, Avgiftsgrunnlag, AvgiftsgrunnlagInfo } from "Domene";
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
