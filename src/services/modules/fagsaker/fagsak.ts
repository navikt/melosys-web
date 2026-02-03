import { Fagsak } from "../types";

import { getAsJson, postAsJson, putAsJson } from "../../utils";
import { API_BASE_URL, FAGSAKER } from "../../api-constants";
import { FullmektigHistorikk } from "../types/fagsak";

export const hent = (saksnummer: string): Promise<Fagsak> => getAsJson(`${API_BASE_URL}${FAGSAKER}/${saksnummer}`);

interface SoknadDto {
  periode: {
    fom: string | null;
    tom: string | null;
  };
  land: {
    landkoder: string[];
    flereLandUkjentHvilke: boolean;
  };
}

export interface OpprettReqDto {
  brukerID?: string;
  virksomhetOrgnr?: string;
  hovedpart?: string;
  sakstype?: string;
  sakstema?: string;
  behandlingstema: string;
  behandlingstype: string;
  soknadDto?: SoknadDto;
  skalTilordnes: boolean;
  oppgaveID?: string;
  mottaksdato?: string;
  behandlingsaarsakType?: string;
  behandlingsaarsakFritekst?: string;
}

export const opprettNySak = (body: OpprettReqDto) => postAsJson(`${API_BASE_URL}${FAGSAKER}`, body);

export const opprettNyBehandlingForSak = (saksnummer: string, body: OpprettReqDto) =>
  postAsJson(`${API_BASE_URL}${FAGSAKER}/${saksnummer}/behandlinger`, body);

export interface HenleggReqDto {
  begrunnelseKode: string;
  fritekst: string | null;
}

export const henlegg = (saksnummer: string, body: HenleggReqDto) =>
  postAsJson(`${API_BASE_URL}${FAGSAKER}/${saksnummer}/henlegg`, body);

export const bortfall = (behandlingID: number) =>
  putAsJson(`${API_BASE_URL}${FAGSAKER}/${behandlingID}/henlegg-som-bortfalt`);

interface Vedlegg {
  journalpostID: string;
  dokumentID: string;
}

export interface VideresendReqDto {
  mottakerinstitusjon: string | null;
  fritekst: string | null;
  ytterligereInformasjonSed: string | null;
  a008Formaal: string | null;
  vedlegg: Vedlegg[];
}

export const videresend = (saksnummer: string, body: VideresendReqDto) =>
  postAsJson(`${API_BASE_URL}${FAGSAKER}/${saksnummer}/henlegg-videresend`, body);

interface UtpekReqDto {
  mottakerinstitusjoner: string[];
  fritekstSed: string | null;
  fritekstBrev: string | null;
}

export const utpek = (saksnummer: string, body: UtpekReqDto) =>
  postAsJson(`${API_BASE_URL}${FAGSAKER}/${saksnummer}/utpek`, body);

export interface EndreSakDto {
  behandlingID: number;
  sakstype: string;
  sakstema: string;
  behandlingstema: string;
  behandlingstype: string;
  behandlingsstatus?: string | null;
  mottaksdato?: string | null;
}

export interface TrygdeavgiftOppsummering {
  harBehandlingMedTrygdeavgift: boolean;
}

export const endreFagsak = (saksnummer: string, body: EndreSakDto) =>
  putAsJson(`${API_BASE_URL}${FAGSAKER}/${saksnummer}`, body);

export const ferdigbehandle = (behandlingID: number) =>
  putAsJson(`${API_BASE_URL}${FAGSAKER}/${behandlingID}/ferdigbehandle`);

export const hentTrygdeavgiftOppsummering = (saksnummer: string): Promise<TrygdeavgiftOppsummering> =>
  getAsJson(`${API_BASE_URL}${FAGSAKER}/${saksnummer}/trygdeavgift/oppsummering`);

export const annullerFagsak = (saksnummer: string) =>
  postAsJson(`${API_BASE_URL}${FAGSAKER}/${saksnummer}/annullering`);

export const hentFullmektigHistorikk = (saksnummer: string): Promise<FullmektigHistorikk[]> =>
  getAsJson(`${API_BASE_URL}${FAGSAKER}/${saksnummer}/aktoerer/FULLMEKTIG/historikk`);

export const lagreBetalingsvalgForPensjonister = (saksnummer: string, betalingstype: string) =>
  putAsJson(`${API_BASE_URL}${FAGSAKER}/${saksnummer}/betalingsvalg`, betalingstype);
