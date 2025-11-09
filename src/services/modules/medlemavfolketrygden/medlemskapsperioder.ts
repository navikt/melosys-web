import { deleteAsJson, getAsJson, postAsJson, putAsJson } from "../../utils";
import { API_BASE_URL, BEHANDLINGER, MEDLEMSKAPSPERIODER } from "../../api-constants";

export interface Avgiftspliktigperiode {
  id: number;
  fomDato: string;
  tomDato: string;
  bestemmelse: string;
  innvilgelsesResultat: string;
  trygdedekning: string;
  medlemskapstype: string;
  type?: "MEDLEMSKAPSPERIODE" | "HELSEUTGIFTDEKKESPERIODE" | "LOVVALGSPERIODE";
  redigerbar?: boolean;
}

export interface OppdaterMedlemskapsperiode {
  fomDato: string;
  tomDato?: string | null;
  innvilgelsesResultat: string;
  bestemmelse: string;
  trygdedekning: string;
}

export const hentMedlemskapsperioder = (behandlingID: number) =>
  getAsJson(`${API_BASE_URL}${BEHANDLINGER}/${behandlingID}/${MEDLEMSKAPSPERIODER}`);

export const opprettMedlemskapsperioder = (behandlingID: number, data: OppdaterMedlemskapsperiode) =>
  postAsJson(`${API_BASE_URL}${BEHANDLINGER}/${behandlingID}/${MEDLEMSKAPSPERIODER}`, data);

export const oppdaterMedlemskapsperioder = (
  behandlingID: number,
  medlemskapsID: number,
  data: OppdaterMedlemskapsperiode,
) => putAsJson(`${API_BASE_URL}${BEHANDLINGER}/${behandlingID}/${MEDLEMSKAPSPERIODER}/${medlemskapsID}`, data);

export const slettMedlemskapsperiode = (behandlingID: number, medlemskapsID: number) =>
  deleteAsJson(`${API_BASE_URL}${BEHANDLINGER}/${behandlingID}/${MEDLEMSKAPSPERIODER}/${medlemskapsID}`);

export const slettMedlemskapsperioder = (behandlingID: number) =>
  deleteAsJson(`${API_BASE_URL}${BEHANDLINGER}/${behandlingID}/${MEDLEMSKAPSPERIODER}`);

export const opprettForeslåtteMedlemskapsperioder = (behandlingID: number, bestemmelse: string) =>
  postAsJson(`${API_BASE_URL}${BEHANDLINGER}/${behandlingID}/${MEDLEMSKAPSPERIODER}/forslag`, { bestemmelse });

export function harPerioderFraTidligereÅr(avgiftspliktigperioder: Avgiftspliktigperiode[]): boolean {
  return (
    avgiftspliktigperioder.length > 0 &&
    avgiftspliktigperioder.some((periode) => new Date(periode.fomDato).getFullYear() < new Date().getFullYear())
  );
}
