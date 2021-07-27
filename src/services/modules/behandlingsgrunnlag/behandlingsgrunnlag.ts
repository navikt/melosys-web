import { API_BASE_URL, BEHANDLINGSGRUNNLAG } from "../../api-constants";

import { getAsJson, postAsJson } from "../../utils";

import { TheRootSchema as Behandlingsgrunnlag } from "./types";

export const hent = (behandlingID: number): Promise<Behandlingsgrunnlag> =>
  getAsJson(`${API_BASE_URL}${BEHANDLINGSGRUNNLAG}/${behandlingID}`);
export const send = (behandlingID: number, behandlingsgrunnlag: Behandlingsgrunnlag): Promise<Behandlingsgrunnlag> =>
  postAsJson(`${API_BASE_URL}${BEHANDLINGSGRUNNLAG}/${behandlingID}`, behandlingsgrunnlag);
