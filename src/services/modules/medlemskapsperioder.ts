import { deleteAsJson, getAsJson, postAsJson, putAsJson } from "../utils";
import { API_BASE_URL, BEHANDLINGER, MEDLEMSKAPSPERIODER } from "../api-constants";

export interface VilkårOgBegrunnelser {
  vilkår: string;
  muligeBegrunnelser: string[];
}

export interface BestemmelseMedVilkårOgBegrunnelser {
  bestemmelse: string;
  vilkårOgBegrunnelser: VilkårOgBegrunnelser[];
}

export interface HentBestemmelserResponse {
  støttedeBestemmelser: BestemmelseMedVilkårOgBegrunnelser[];
  ikkeStøttedeBestemmelser: string[];
}

export type Medlemskapsperiode = {
  id: number;
  arbeidsland: string;
  fomDato: string;
  tomDato: string;
  bestemmelse: string;
  innvilgelsesResultat: string;
  trygdedekning: string;
  medlemskapstype: string;
};

export type OppdaterMedlemskapsperiode = {
  fomDato: string;
  tomDato?: string | null;
  innvilgelsesResultat: string;
  trygdedekning: string;
};

export const getMedlemskapsperioder = (behandlingID: number) =>
  getAsJson(`${API_BASE_URL}${BEHANDLINGER}/${behandlingID}/${MEDLEMSKAPSPERIODER}`);

export const postMedlemskapsperioder = (behandlingID: number, data: OppdaterMedlemskapsperiode) =>
  postAsJson(`${API_BASE_URL}${BEHANDLINGER}/${behandlingID}/${MEDLEMSKAPSPERIODER}`, data);

export const putMedlemskapsperioder = (behandlingID: number, medlemskapsID: number, data: OppdaterMedlemskapsperiode) =>
  putAsJson(`${API_BASE_URL}${BEHANDLINGER}/${behandlingID}/${MEDLEMSKAPSPERIODER}/${medlemskapsID}`, data);

export const deleteMedlemskapsperioder = (behandlingID: number, medlemskapsID: number) =>
  deleteAsJson(`${API_BASE_URL}${BEHANDLINGER}/${behandlingID}/${MEDLEMSKAPSPERIODER}/${medlemskapsID}`);

export const hentBestemmelser = (behandlingstema: string): Promise<HentBestemmelserResponse> =>
  getAsJson(`${API_BASE_URL}${BEHANDLINGER}/${MEDLEMSKAPSPERIODER}/bestemmelser/${behandlingstema}`);

export const opprettMedlemskapsperioderFraBestemmelse = (behandlingID: number, bestemmelse: string) =>
  postAsJson(`${API_BASE_URL}${BEHANDLINGER}/${behandlingID}/${MEDLEMSKAPSPERIODER}/bestemmelser`, { bestemmelse });
