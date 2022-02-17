import { getAsJson } from "../../utils";
import { API_BASE_URL, BEHANDLINGER } from "../../api-constants";

export const hentMuligeBehandlingstyper = (behandlingID: string) =>
  getAsJson(`${API_BASE_URL}${BEHANDLINGER}/${behandlingID}/mulige-typer`);
