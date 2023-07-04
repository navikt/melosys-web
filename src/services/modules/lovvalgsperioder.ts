import { getAsJson, postAsJson } from "../utils";
import { API_BASE_URL, LOVVALGSPERIODER } from "../api-constants";

export interface Lovvalgsperiode {
  fomDato: string;
  tomDato?: string;
  lovvalgsbestemmelse?: string;
  tilleggBestemmelse?: string;
  lovvalgsland: string;
  innvilgelsesResultat: string;
  trygdeDekning: string;
  medlemskapstype: string;
  medlemskapsperiodeID?: string;
}

export interface OpprettLovvalgsperiode {
  fomDato?: string;
  tomDato?: string;
  lovvalgsbestemmelse?: string;
  innvilgelsesResultat?: string;
}

export const hent = (behandlingID: number): Promise<Lovvalgsperiode[]> =>
  getAsJson(`${API_BASE_URL}${LOVVALGSPERIODER}/${behandlingID}`);

export const send = (behandlingID: number, data: Lovvalgsperiode[]): Promise<Lovvalgsperiode[]> =>
  postAsJson(`${API_BASE_URL}${LOVVALGSPERIODER}/${behandlingID}`, data);

export const hentOpprinnelig = (behandlingID: number) =>
  getAsJson(`${API_BASE_URL}${LOVVALGSPERIODER}/${behandlingID}/opprinnelig`);

export const opprettLovvalgsperiode = (
  behandlingID: number,
  data: OpprettLovvalgsperiode
): Promise<Lovvalgsperiode[]> => postAsJson(`${API_BASE_URL}${LOVVALGSPERIODER}/${behandlingID}/opprett`, data);
