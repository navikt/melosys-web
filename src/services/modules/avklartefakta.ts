import { getAsJson, postAsJson } from "../utils";
import { API_BASE_URL, AVKLARTEFAKTA } from "../api-constants";

export interface Avklartfakta {
  avklartefaktaKode: string | null;
  begrunnelseFritekst: string | null;
  begrunnelseKoder: string[];
  fakta: string[];
  referanse: string;
  subjektID: string | null;
}

export const hent = (behandlingID: number): Promise<Avklartfakta[]> =>
  getAsJson(`${API_BASE_URL}${AVKLARTEFAKTA}/${behandlingID}`);

export const send = (behandlingID: number, avklartefakta: Avklartfakta[]): Promise<Avklartfakta[]> =>
  postAsJson(`${API_BASE_URL}${AVKLARTEFAKTA}/${behandlingID}`, avklartefakta);

interface Oppsummering {
  virksomheter: string[];
  arbeidsland: string[];
  fullstendingManglendeInnbetaling: boolean;
}

export const hentOppsummering = (behandlingID: number): Promise<Oppsummering> =>
  getAsJson(`${API_BASE_URL}${AVKLARTEFAKTA}/${behandlingID}/oppsummering`);

export type Virksomheter = {
  virksomhetIDer: string[];
};

export type Arbeidsland = {
  arbeidsland: string[];
};

export type FullstendigManglendeInnbetaling = {
  fullstendigManglendeInnbetaling?: boolean;
};

export const sendVirksomheter = (behandlingID: number, virksomheter: Virksomheter): Promise<Oppsummering> =>
  postAsJson(`${API_BASE_URL}${AVKLARTEFAKTA}/${behandlingID}/virksomheter`, virksomheter);

export const sendArbeidsland = (behandlingID: number, arbeidsland: Arbeidsland): Promise<Oppsummering> =>
  postAsJson(`${API_BASE_URL}${AVKLARTEFAKTA}/${behandlingID}/arbeidsland`, arbeidsland);

export const sendInnbetalingsstatus = (
  behandlingID: number,
  fullstendigManglendeInnbetaling?: boolean
): Promise<Oppsummering> =>
  postAsJson(`${API_BASE_URL}${AVKLARTEFAKTA}/${behandlingID}/innbetalingsstatus`, fullstendigManglendeInnbetaling);
