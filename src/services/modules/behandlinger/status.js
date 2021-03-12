import { getAsJson, postAsJson } from "../../utils";
import { API_BASE_URL, BEHANDLINGER } from "../../api-constants";

export const hentMuligeBehandlingsstatuser = (behandlingID) =>
  getAsJson(`${API_BASE_URL}${BEHANDLINGER}/${behandlingID}/muligeBehandlingsstatuser`);

export const oppdaterStatus = (behandlingID, status) =>
  postAsJson(`${API_BASE_URL}${BEHANDLINGER}/${behandlingID}/status`, { behandlingsstatus: status });
