import { deleteAsJson, getAsJson, postAsJson, putAsJson } from "../../utils";
import { API_BASE_URL, BEHANDLINGER, MEDLEMSKAPSPERIODER } from "../../api-constants";

// Felles felt for alle avgiftspliktige perioder
interface BaseAvgiftspliktigperiode {
  id: number;
  fomDato: string;
  tomDato: string;
  redigerbar?: boolean;
}

// Medlemskapsperiode - har alle de komplekse feltene
export interface Medlemskapsperiode extends BaseAvgiftspliktigperiode {
  type: "MEDLEMSKAPSPERIODE";
  bestemmelse: string;
  innvilgelsesResultat: string;
  trygdedekning: string;
  medlemskapstype: string;
}

// Helseutgiftdekkesperiode i årsavregning-kontekst - kun datoer
// NB: HelseutgiftDekkesPeriodeDto (egen fil) brukes for CRUD og har bostedLandkode
export interface Helseutgiftdekkesperiode extends BaseAvgiftspliktigperiode {
  type: "HELSEUTGIFTDEKKESPERIODE";
}

// Lovvalgsperiode - backend har også lovvalgsland og tilleggsbestemmelse, men ikke eksponert i AvgiftspliktigPeriodeDto
export interface Lovvalgsperiode extends BaseAvgiftspliktigperiode {
  type: "LOVVALGSPERIODE";
  bestemmelse: string;
  innvilgelsesResultat: string;
  trygdedekning: string;
  medlemskapstype: string;
}

// Discriminated union
export type Avgiftspliktigperiode = Medlemskapsperiode | Helseutgiftdekkesperiode | Lovvalgsperiode;

// Type guard hjelpefunksjoner
export const erMedlemskapsperiode = (periode: Avgiftspliktigperiode): periode is Medlemskapsperiode => {
  return periode.type === "MEDLEMSKAPSPERIODE";
};

export const erLovvalgsperiode = (periode: Avgiftspliktigperiode): periode is Lovvalgsperiode => {
  return periode.type === "LOVVALGSPERIODE";
};

export const erHelseutgiftdekkesperiode = (periode: Avgiftspliktigperiode): periode is Helseutgiftdekkesperiode => {
  return periode.type === "HELSEUTGIFTDEKKESPERIODE";
};

export const harInnvilgelsesResultat = (
  periode: Avgiftspliktigperiode,
): periode is Medlemskapsperiode | Lovvalgsperiode => {
  return erMedlemskapsperiode(periode) || erLovvalgsperiode(periode);
};

/**
 * Request DTO for opprettelse/oppdatering av medlemskapsperiode.
 * Utledet fra Medlemskapsperiode, men tomDato er valgfri.
 */
export interface OppdaterMedlemskapsperiode
  extends Pick<Medlemskapsperiode, "fomDato" | "innvilgelsesResultat" | "bestemmelse" | "trygdedekning"> {
  tomDato?: string | null;
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
