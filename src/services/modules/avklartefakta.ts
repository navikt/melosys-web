import { deleteAsJson, getAsJson, postAsJson } from "../utils";
import { API_BASE_URL, AVKLARTEFAKTA } from "../api-constants";

export interface Avklartfakta {
  avklartefaktaKode: string | null;
  begrunnelseFritekst: string | null;
  begrunnelseKoder: string[];
  fakta: string[];
  referanse: string;
  subjektID: string | null;
}

interface Oppsummering {
  virksomheter: string[];
  arbeidsland: string[];
  fullstendigManglendeInnbetaling: boolean;
  ikkeYrkesaktivFamilieRelasjonstype?: string;
  ikkeYrkesaktivOppholdstype?: string;
  arbeidssituasjonType?: string;
  ukjentSluttdato?: boolean;
}

export const hent = (behandlingID: number): Promise<Avklartfakta[]> =>
  getAsJson(`${API_BASE_URL}${AVKLARTEFAKTA}/${behandlingID}`);

export const send = (behandlingID: number, avklartefakta: Avklartfakta[]): Promise<Avklartfakta[]> =>
  postAsJson(`${API_BASE_URL}${AVKLARTEFAKTA}/${behandlingID}`, avklartefakta);

export const sendIkkeYrkesaktivOppholdstype = (behandlingID: number, oppholdstype: string): Promise<Oppsummering> =>
  postAsJson(`${API_BASE_URL}${AVKLARTEFAKTA}/${behandlingID}/oppholdstype`, oppholdstype);

export const sendIkkeYrkesaktivRelasjonstype = (
  behandlingID: number,
  familierelasjonstype: string,
): Promise<Oppsummering> =>
  postAsJson(`${API_BASE_URL}${AVKLARTEFAKTA}/${behandlingID}/familierelasjonstype`, familierelasjonstype);

export const sendArbeidssituasjontype = (behandlingID: number, arbeidssituasjontype: string): Promise<Oppsummering> =>
  postAsJson(`${API_BASE_URL}${AVKLARTEFAKTA}/${behandlingID}/arbeidssituasjontype`, arbeidssituasjontype);

export const slettAvklartefakta = (behandlingID: number, avklartefaktatype: string): Promise<Oppsummering> =>
  deleteAsJson(`${API_BASE_URL}${AVKLARTEFAKTA}/${behandlingID}/${avklartefaktatype}`);

export const hentOppsummering = (behandlingID: number): Promise<Oppsummering> =>
  getAsJson(`${API_BASE_URL}${AVKLARTEFAKTA}/${behandlingID}/oppsummering`);

export interface Virksomheter {
  virksomhetIDer: string[];
}

export interface Arbeidsland {
  arbeidsland: string[];
}

export interface FullstendigManglendeInnbetaling {
  fullstendigManglendeInnbetaling?: boolean;
}

export const sendVirksomheter = (behandlingID: number, virksomheter: Virksomheter): Promise<Oppsummering> =>
  postAsJson(`${API_BASE_URL}${AVKLARTEFAKTA}/${behandlingID}/virksomheter`, virksomheter);

export const sendArbeidsland = (behandlingID: number, arbeidsland: Arbeidsland): Promise<Oppsummering> =>
  postAsJson(`${API_BASE_URL}${AVKLARTEFAKTA}/${behandlingID}/arbeidsland`, arbeidsland);

export const sendUkjentSluttdato = (behandlingID: number, ukjentSluttdato: boolean): Promise<Oppsummering> =>
  postAsJson(`${API_BASE_URL}${AVKLARTEFAKTA}/${behandlingID}/ukjent-sluttdato-medlemskapsperiode`, ukjentSluttdato);

export const sendInnbetalingsstatus = (
  behandlingID: number,
  fullstendigManglendeInnbetaling?: boolean,
): Promise<Oppsummering> =>
  postAsJson(`${API_BASE_URL}${AVKLARTEFAKTA}/${behandlingID}/innbetalingsstatus`, fullstendigManglendeInnbetaling);
