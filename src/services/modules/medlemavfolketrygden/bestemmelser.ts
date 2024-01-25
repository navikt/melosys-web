import { getAsJson } from "../../utils";
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

export const hentMuligeBestemmelser = (behandlingstema: string): Promise<HentMuligeBestemmelserResponse> =>
  getAsJson(`${API_BASE_URL}${BEHANDLINGER}/${MEDLEM_AV_FOLKETRYGDEN}/${BESTEMMELSER}/${behandlingstema}`);
