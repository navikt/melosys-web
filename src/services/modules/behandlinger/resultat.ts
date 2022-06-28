import { getAsJson, postAsJson } from "../../utils";
import { API_BASE_URL, BEHANDLINGER } from "../../api-constants";

export interface OppdaterFritekster {
  innledningFritekst?: string;
  begrunnelseFritekst?: string;
}

export interface AngiBehandlingsresultattype {
  type: string;
}

export const hentResultat = (behandlingID: string) =>
  getAsJson(`${API_BASE_URL}${BEHANDLINGER}/${behandlingID}/resultat`);

export const oppdatererFritekster = (behandlingID: string, data: OppdaterFritekster) =>
  postAsJson(`${API_BASE_URL}${BEHANDLINGER}/${behandlingID}/resultat/fritekst`, data);

export const angiBehandlingsresultattype = (behandlingID: string, data: AngiBehandlingsresultattype) =>
  postAsJson(`${API_BASE_URL}${BEHANDLINGER}/${behandlingID}/resultat/type`, data);
