import { getAsJson } from "../../utils";
import { API_BASE_URL, BEHANDLINGER } from "../../api-constants";

export const hentMuligeBehandlingsstatuser = (behandlingID) =>
  getAsJson(`${API_BASE_URL}${BEHANDLINGER}/${behandlingID}/mulige-statuser`);
