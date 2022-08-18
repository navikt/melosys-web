import { getAsJson } from "../../utils";
import { API_BASE_URL, BEHANDLINGER } from "../../api-constants";

export const hentMuligeSakstema = (behandlingID) =>
  getAsJson(`${API_BASE_URL}${BEHANDLINGER}/${behandlingID}/mulige-sakstema`);

export const hentMuligeSakstype = (behandlingID) =>
  getAsJson(`${API_BASE_URL}${BEHANDLINGER}/${behandlingID}/mulige-sakstype`);
