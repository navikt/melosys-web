import { deleteAsJson, getAsJson, postAsJson, putAsJson } from "../../utils";
import { API_BASE_URL, BEHANDLINGER, MEDLEMSKAPSPERIODER } from "../../api-constants";
import type { Medlemskapsperiode, Avgiftspliktigperiode } from "../types/periodeTyper";

/**
 * Request DTO for opprettelse/oppdatering av medlemskapsperiode.
 * Utledet fra Medlemskapsperiode, men tomDato er valgfri.
 */
export interface OppdaterMedlemskapsperiode
  extends Pick<Medlemskapsperiode, "fomDato" | "innvilgelsesResultat" | "bestemmelse" | "trygdedekning"> {
  tomDato?: string | null;
}

export const hentMedlemskapsperioder = (behandlingID: number): Promise<Medlemskapsperiode[]> =>
  getAsJson(`${API_BASE_URL}${BEHANDLINGER}/${behandlingID}/${MEDLEMSKAPSPERIODER}`);

export const opprettMedlemskapsperioder = (
  behandlingID: number,
  data: OppdaterMedlemskapsperiode,
): Promise<Medlemskapsperiode> =>
  postAsJson(`${API_BASE_URL}${BEHANDLINGER}/${behandlingID}/${MEDLEMSKAPSPERIODER}`, data);

export const oppdaterMedlemskapsperioder = (
  behandlingID: number,
  medlemskapsID: number,
  data: OppdaterMedlemskapsperiode,
): Promise<Medlemskapsperiode> =>
  putAsJson(`${API_BASE_URL}${BEHANDLINGER}/${behandlingID}/${MEDLEMSKAPSPERIODER}/${medlemskapsID}`, data);

export const slettMedlemskapsperiode = (behandlingID: number, medlemskapsID: number): Promise<void> =>
  deleteAsJson(`${API_BASE_URL}${BEHANDLINGER}/${behandlingID}/${MEDLEMSKAPSPERIODER}/${medlemskapsID}`);

export const slettMedlemskapsperioder = (behandlingID: number): Promise<void> =>
  deleteAsJson(`${API_BASE_URL}${BEHANDLINGER}/${behandlingID}/${MEDLEMSKAPSPERIODER}`);

export const opprettForeslåtteMedlemskapsperioder = (
  behandlingID: number,
  bestemmelse: string,
): Promise<Medlemskapsperiode[]> =>
  postAsJson(`${API_BASE_URL}${BEHANDLINGER}/${behandlingID}/${MEDLEMSKAPSPERIODER}/forslag`, { bestemmelse });

export function harPerioderFraTidligereÅr(avgiftspliktigperioder: Avgiftspliktigperiode[]): boolean {
  return (
    avgiftspliktigperioder.length > 0 &&
    avgiftspliktigperioder.some((periode) => new Date(periode.fomDato).getFullYear() < new Date().getFullYear())
  );
}
