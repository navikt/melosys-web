import { API_BASE_URL, REPRESENTANT } from "../api-constants";

import { cachedGetAsJson, getAsJson, postAsJson } from "../utils";

export interface Representant {
  nummer: string;
  navn: string;
}

export interface RepresentantData {
  nummer: string;
  navn: string;
  adresselinjer: string[];
  postnummer: string | null;
  orgnr: string | null;
}

export interface ValgtRepresentant {
  representantnummer: string;
  selvbetalende: boolean;
  organisasjonsnummer: string | null | undefined;
  kontaktperson: string | null | undefined;
}

export const hentRepresentantListe = (): Promise<Representant[]> =>
  cachedGetAsJson(`${API_BASE_URL}${REPRESENTANT}/liste`);
export const hentRepresentant = (representantID: string): Promise<RepresentantData> =>
  cachedGetAsJson(`${API_BASE_URL}${REPRESENTANT}/${representantID}`);
export const hentValgtRepresentant = (behandlingID: string): Promise<ValgtRepresentant> =>
  getAsJson(`${API_BASE_URL}${REPRESENTANT}/valgt/${behandlingID}`);
export const sendValgtRepresentant = (behandlingID: string, data: ValgtRepresentant): Promise<ValgtRepresentant> =>
  postAsJson(`${API_BASE_URL}${REPRESENTANT}/valgt/${behandlingID}`, data);
