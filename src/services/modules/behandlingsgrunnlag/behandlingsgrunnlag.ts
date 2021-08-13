import { API_BASE_URL, BEHANDLINGSGRUNNLAG } from "../../api-constants";

import { getAsJson, postAsJson } from "../../utils";

import { BehandlingsgrunnlagResDto, BehandlingsgrunnlagReqDto } from "./types";

export const hent = (behandlingID: number): Promise<BehandlingsgrunnlagResDto> =>
  getAsJson(`${API_BASE_URL}${BEHANDLINGSGRUNNLAG}/${behandlingID}`);
export const send = (
  behandlingID: number,
  behandlingsgrunnlag: BehandlingsgrunnlagReqDto
): Promise<BehandlingsgrunnlagResDto> =>
  postAsJson(`${API_BASE_URL}${BEHANDLINGSGRUNNLAG}/${behandlingID}`, behandlingsgrunnlag);
