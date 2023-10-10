import { getAsJson, postAsJson } from "../../utils";
import { API_BASE_URL, BEHANDLINGER, BESTEMMELSER, MEDLEM_AV_FOLKETRYGDEN } from "../../api-constants";

export interface VilkårOgBegrunnelser {
  vilkår: string;
  muligeBegrunnelser: string[];
}

export interface BestemmelseMedVilkårOgBegrunnelser {
  bestemmelse: string;
  vilkårOgBegrunnelser: VilkårOgBegrunnelser[];
}

export interface HentMuligeBestemmelserResponse {
  støttedeBestemmelser: BestemmelseMedVilkårOgBegrunnelser[];
  ikkeStøttedeBestemmelser: string[];
}

export type HentBestemmelseResponse = {
  bestemmelse: string;
};

export const getBestemmelse = (behandlingID: number): Promise<HentBestemmelseResponse> =>
  getAsJson(`${API_BASE_URL}${BEHANDLINGER}/${behandlingID}/${MEDLEM_AV_FOLKETRYGDEN}/${BESTEMMELSER}`);

export const postBestemmelse = (behandlingID: number, bestemmelse: string): Promise<HentBestemmelseResponse> =>
  postAsJson(`${API_BASE_URL}${BEHANDLINGER}/${behandlingID}/${MEDLEM_AV_FOLKETRYGDEN}/${BESTEMMELSER}`, {
    bestemmelse,
  });

export const hentMuligeBestemmelser = (behandlingstema: string): Promise<HentMuligeBestemmelserResponse> =>
  getAsJson(`${API_BASE_URL}${BEHANDLINGER}/${MEDLEM_AV_FOLKETRYGDEN}/${BESTEMMELSER}/${behandlingstema}`);
