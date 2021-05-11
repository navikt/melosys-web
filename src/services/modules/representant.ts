import { API_BASE_URL, REPRESENTANT } from "../api-constants";

import { cachedGetAsJson, getAsJson, postAsJson } from "../utils";

export type RepresentantListeResDto = {
  nummer: string;
  navn: string;
}[];

export interface RepresentantDataResDto {
  nummer: string;
  navn: string;
  adresselinjer: string[];
  postnummer: string | null;
  orgnr: string | null;
}

export interface ValgtRepresentantResDto {
  representantnummer: string;
  selvbetalende: boolean;
  organisasjonsnummer: string | null | undefined;
  kontaktperson: string | null | undefined;
}

export interface ValgtRepresentantReqDto extends ValgtRepresentantResDto {}

export const hentRepresentantListe = (): Promise<RepresentantListeResDto> =>
  cachedGetAsJson(`${API_BASE_URL}${REPRESENTANT}/liste`);
export const hentRepresentant = (representantID: string): Promise<RepresentantDataResDto> =>
  cachedGetAsJson(`${API_BASE_URL}${REPRESENTANT}/${representantID}`);
export const hentValgtRepresentant = (behandlingID: string): Promise<ValgtRepresentantResDto> =>
  getAsJson(`${API_BASE_URL}${REPRESENTANT}/valgt/${behandlingID}`);
export const sendValgtRepresentant = (
  behandlingID: string,
  data: ValgtRepresentantReqDto
): Promise<ValgtRepresentantResDto> => postAsJson(`${API_BASE_URL}${REPRESENTANT}/valgt/${behandlingID}`, data);
