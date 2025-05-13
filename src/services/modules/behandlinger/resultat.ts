import { getAsJson, postAsJson, putAsJson } from "../../utils";
import { API_BASE_URL, BEHANDLINGER } from "../../api-constants";

export interface OppdaterFritekster {
  innledningFritekst?: string;
  begrunnelseFritekst?: string;
  trygdeavgiftFritekst?: string;
}

export interface AngiBehandlingsresultattype {
  type: string;
}

export interface OppdaterUtfallRegistreringUnntak {
  utfallRegistreringUnntak: string;
}

export const hentResultat = (behandlingID: number) =>
  getAsJson(`${API_BASE_URL}${BEHANDLINGER}/${behandlingID}/resultat`);

export const oppdaterFritekster = (behandlingID: number, data: OppdaterFritekster) =>
  postAsJson(`${API_BASE_URL}${BEHANDLINGER}/${behandlingID}/resultat/fritekst`, data);

export const oppdaterNyVurderingBakgrunn = (behandlingID: number, nyVurderingBakgrunn?: string) =>
  postAsJson(`${API_BASE_URL}${BEHANDLINGER}/${behandlingID}/resultat/nyvurderingbakgrunn`, {
    nyVurderingBakgrunn,
  });

export const oppdaterUtfallRegistreringUnntak = (behandlingID: number, data: OppdaterUtfallRegistreringUnntak) =>
  putAsJson(`${API_BASE_URL}${BEHANDLINGER}/${behandlingID}/resultat/utfallregistreringunntak`, data);

export const angiBehandlingsresultattype = (behandlingID: number, data: AngiBehandlingsresultattype) =>
  postAsJson(`${API_BASE_URL}${BEHANDLINGER}/${behandlingID}/resultat/type`, data);
