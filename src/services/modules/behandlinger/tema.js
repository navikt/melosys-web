import { getAsJson } from "../../utils";
import { API_BASE_URL, BEHANDLINGER } from "../../api-constants";

// Kan fjernes med melosys.behandle_alle_saker
export const hentMuligeBehandlingstema = (behandlingID) =>
  getAsJson(`${API_BASE_URL}${BEHANDLINGER}/${behandlingID}/mulige-behandlingstema`);
