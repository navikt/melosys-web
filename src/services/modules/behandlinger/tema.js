import { getAsJson, postAsJson } from "../../utils";
import { API_BASE_URL, BEHANDLINGER } from "../../api-constants";

export const hentMuligeBehandlingstema = (behandlingID) =>
  getAsJson(`${API_BASE_URL}${BEHANDLINGER}/${behandlingID}/muligebehandlingstema`);

export const endreBehandlingstema = (behandlingID, behandlingstema) =>
  postAsJson(`${API_BASE_URL}${BEHANDLINGER}/${behandlingID}/endreBehandlingstema`, { behandlingstema });
