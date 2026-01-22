import { deleteAsJson, getAsJson, postAsJson, putAsJson } from "../utils";
import { API_BASE_URL, BEHANDLINGER, LOVVALGSPERIODER } from "../api-constants";

export interface Lovvalgsperiode {
  periodeID?: string;
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
  trygdedekning?: string;
}

export const hent = (behandlingID: number): Promise<Lovvalgsperiode[]> =>
  getAsJson(`${API_BASE_URL}${LOVVALGSPERIODER}/${behandlingID}`);

export const send = (behandlingID: number, data: Lovvalgsperiode[]): Promise<Lovvalgsperiode[]> => {
  if (data.length === 0) {
    return Promise.resolve([]);
  }
  return postAsJson(`${API_BASE_URL}${LOVVALGSPERIODER}/${behandlingID}`, data);
};

export const hentOpprinnelig = (behandlingID: number) =>
  getAsJson(`${API_BASE_URL}${LOVVALGSPERIODER}/${behandlingID}/opprinnelig`);

export const opprettLovvalgsperiode = (
  behandlingID: number,
  data: OpprettLovvalgsperiode,
): Promise<Lovvalgsperiode[]> => postAsJson(`${API_BASE_URL}${BEHANDLINGER}/${behandlingID}/${LOVVALGSPERIODER}`, data);

export const oppdaterLovvalgsperiode = (
  behandlingID: number,
  lovvalgsperiodeID: number,
  data: Lovvalgsperiode,
): Promise<Lovvalgsperiode> =>
  putAsJson(`${API_BASE_URL}${BEHANDLINGER}/${behandlingID}/${LOVVALGSPERIODER}/${lovvalgsperiodeID}`, data);

export const slettLovvalgsperiode = (behandlingID: number, lovvalgsperiodeID: number) =>
  deleteAsJson(`${API_BASE_URL}${BEHANDLINGER}/${behandlingID}/${LOVVALGSPERIODER}/${lovvalgsperiodeID}`);
