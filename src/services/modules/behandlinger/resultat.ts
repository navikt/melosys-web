import { getAsJson, postAsJson, putAsJson } from "../../utils";
import { API_BASE_URL, BEHANDLINGER } from "../../api-constants";

export interface OppdaterFritekster {
  innledningFritekst?: string;
  begrunnelseFritekst?: string;
}

export interface AngiBehandlingsresultattype {
  type: string;
}

export interface OppdaterUtfallRegistreringUnntak {
  utfallRegistreringUnntak: string;
}

export const hentResultat = (behandlingID: string) =>
  getAsJson(`${API_BASE_URL}${BEHANDLINGER}/${behandlingID}/resultat`);

export const oppdaterFritekster = (behandlingID: string, data: OppdaterFritekster) =>
  postAsJson(`${API_BASE_URL}${BEHANDLINGER}/${behandlingID}/resultat/fritekst`, data);

export const oppdaterUtfallRegistreringUnntak = (behandlingID: string, data: OppdaterUtfallRegistreringUnntak) =>
  putAsJson(`${API_BASE_URL}${BEHANDLINGER}/${behandlingID}/resultat/utfallregistreringunntak`, data);

export const angiBehandlingsresultattype = (behandlingID: string, data: AngiBehandlingsresultattype) =>
  postAsJson(`${API_BASE_URL}${BEHANDLINGER}/${behandlingID}/resultat/type`, data);
