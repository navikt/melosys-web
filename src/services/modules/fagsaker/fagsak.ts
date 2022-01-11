import { Fagsak } from "../types";

import { getAsJson, postAsJson, putAsText } from "../../utils";
import { API_BASE_URL, FAGSAKER } from "../../api-constants";

export const hent = (saksnummer: string): Promise<Fagsak> => getAsJson(`${API_BASE_URL}${FAGSAKER}/${saksnummer}`);

interface SoknadDto {
  periode: {
    fom: string | null;
    tom: string | null;
  };
  land: string[];
}
interface OpprettReqDto {
  brukerID: string;
  sakstype: string;
  behandlingstema: string;
  soknadDto: SoknadDto;
  skalTilordnes: boolean;
  oppgaveID: string;
}
export const opprett = (body: OpprettReqDto) => postAsJson(`${API_BASE_URL}${FAGSAKER}/opprett`, body);

interface HenleggReqDto {
  begrunnelseKode: string;
  fritekst: string | null;
}
export const henlegg = (saksnummer: string, body: HenleggReqDto) =>
  postAsJson(`${API_BASE_URL}${FAGSAKER}/${saksnummer}/henlegg`, body);

export const bortfall = (saksnummer: string, behandlingId: string) =>
  putAsText(`${API_BASE_URL}${FAGSAKER}/${saksnummer}/${behandlingId}/avsluttsaksombortfalt`);

interface Vedlegg {
  journalpostID: string;
  dokumentID: string;
}

export interface VideresendReqDto {
  mottakerinstitusjon: string | null;
  fritekst: string | null;
  vedlegg: Vedlegg[];
}
export const videresend = (saksnummer: string, body: VideresendReqDto) =>
  postAsJson(`${API_BASE_URL}${FAGSAKER}/${saksnummer}/henlegg-videresend`, body);

export const avslutt = (saksnummer: string) => putAsText(`${API_BASE_URL}${FAGSAKER}/${saksnummer}/avslutt`);

interface UtpekReqDto {
  mottakerinstitusjoner: string[];
  fritekstSed: string | null;
  fritekstBrev: string | null;
}
export const utpek = (saksnummer: string, body: UtpekReqDto) =>
  postAsJson(`${API_BASE_URL}${FAGSAKER}/${saksnummer}/utpek`, body);

export const revurder = (saksnummer: string) => postAsJson(`${API_BASE_URL}${FAGSAKER}/${saksnummer}/revurder`, {});
