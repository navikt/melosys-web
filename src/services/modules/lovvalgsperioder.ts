import { deleteAsJson, getAsJson, postAsJson, putAsJson } from "../utils";
import { API_BASE_URL, BEHANDLINGER, LOVVALGSPERIODER } from "../api-constants";
import { Lovvalgsperiode } from "./medlemavfolketrygden/medlemskapsperioder";

/**
 * DTO for EU/EØS lovvalgsperioder.
 * Gjenbruker felles felt fra Lovvalgsperiode (årsavregning) via Pick.
 * tomDato er valgfri i DTO (Partial), men påkrevd i Lovvalgsperiode.
 * NB: Backend bruker ulik casing: trygdeDekning (her) vs trygdedekning (årsavregning).
 */
export interface LovvalgsperiodeDto
  extends Pick<Lovvalgsperiode, "fomDato" | "innvilgelsesResultat" | "medlemskapstype">,
    Partial<Pick<Lovvalgsperiode, "tomDato">> {
  periodeID?: string;
  lovvalgsbestemmelse?: string;
  tilleggBestemmelse?: string;
  lovvalgsland: string;
  trygdeDekning: string;
  medlemskapsperiodeID?: string;
}

export interface OpprettLovvalgsperiode {
  fomDato?: string;
  tomDato?: string;
  lovvalgsbestemmelse?: string;
  innvilgelsesResultat?: string;
  trygdedekning?: string;
}

export const hent = (behandlingID: number): Promise<LovvalgsperiodeDto[]> =>
  getAsJson(`${API_BASE_URL}${LOVVALGSPERIODER}/${behandlingID}`);

export const send = (behandlingID: number, data: LovvalgsperiodeDto[]): Promise<LovvalgsperiodeDto[]> => {
  if (data.length === 0) {
    return Promise.resolve([]);
  }
  return postAsJson(`${API_BASE_URL}${LOVVALGSPERIODER}/${behandlingID}`, data);
};

export const hentOpprinnelig = (behandlingID: number): Promise<LovvalgsperiodeDto[]> =>
  getAsJson(`${API_BASE_URL}${LOVVALGSPERIODER}/${behandlingID}/opprinnelig`);

export const opprettLovvalgsperiode = (
  behandlingID: number,
  data: OpprettLovvalgsperiode,
): Promise<LovvalgsperiodeDto[]> =>
  postAsJson(`${API_BASE_URL}${BEHANDLINGER}/${behandlingID}/${LOVVALGSPERIODER}`, data);

export const oppdaterLovvalgsperiode = (
  behandlingID: number,
  lovvalgsperiodeID: number,
  data: LovvalgsperiodeDto,
): Promise<LovvalgsperiodeDto> =>
  putAsJson(`${API_BASE_URL}${BEHANDLINGER}/${behandlingID}/${LOVVALGSPERIODER}/${lovvalgsperiodeID}`, data);

export const slettLovvalgsperiode = (behandlingID: number, lovvalgsperiodeID: number): Promise<void> =>
  deleteAsJson(`${API_BASE_URL}${BEHANDLINGER}/${behandlingID}/${LOVVALGSPERIODER}/${lovvalgsperiodeID}`);
