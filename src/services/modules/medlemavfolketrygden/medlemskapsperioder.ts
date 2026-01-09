import { deleteAsJson, getAsJson, postAsJson, putAsJson } from "../../utils";
import { API_BASE_URL, BEHANDLINGER, MEDLEMSKAPSPERIODER } from "../../api-constants";

// Base interface with common fields
interface BaseAvgiftspliktigperiode {
  id: number;
  fomDato: string;
  tomDato: string;
  redigerbar?: boolean;
}

// Medlemskapsperiode has all the complex fields
export interface Medlemskapsperiode extends BaseAvgiftspliktigperiode {
  type: "MEDLEMSKAPSPERIODE";
  bestemmelse: string;
  innvilgelsesResultat: string;
  trygdedekning: string;
  medlemskapstype: string;
}

// Helseutgiftdekkesperiode only needs dates
export interface Helseutgiftdekkesperiode extends BaseAvgiftspliktigperiode {
  type: "HELSEUTGIFTDEKKESPERIODE";
  // Only dates! Backend also has bostedLandkode, but not exposed in current DTO
}

// Lovvalgsperiode has its own specific fields
export interface Lovvalgsperiode extends BaseAvgiftspliktigperiode {
  type: "LOVVALGSPERIODE";
  bestemmelse: string;
  innvilgelsesResultat: string;
  trygdedekning: string;
  medlemskapstype: string;
  // Backend has lovvalgsland and tilleggsbestemmelse, but not exposed in current DTO
}

// Discriminated union
export type Avgiftspliktigperiode = Medlemskapsperiode | Helseutgiftdekkesperiode | Lovvalgsperiode;

// Type guard helper functions
export const isMedlemskapsperiode = (periode: Avgiftspliktigperiode): periode is Medlemskapsperiode => {
  return periode.type === "MEDLEMSKAPSPERIODE";
};

export const isLovvalgsperiode = (periode: Avgiftspliktigperiode): periode is Lovvalgsperiode => {
  return periode.type === "LOVVALGSPERIODE";
};

export const isHelseutgiftdekkesperiode = (periode: Avgiftspliktigperiode): periode is Helseutgiftdekkesperiode => {
  return periode.type === "HELSEUTGIFTDEKKESPERIODE";
};

export const hasInnvilgelsesResultat = (
  periode: Avgiftspliktigperiode,
): periode is Medlemskapsperiode | Lovvalgsperiode => {
  return isMedlemskapsperiode(periode) || isLovvalgsperiode(periode);
};

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
