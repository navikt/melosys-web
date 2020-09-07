import { getAsJson, postAsJson, putAsText } from '../../utils';
import { API_BASE_URL, FAGSAKER } from '../../api-constants';

export const hent = (snr: number) => getAsJson(`${API_BASE_URL}${FAGSAKER}/${snr}`);

interface SoknadDto {
  periode: {
    fom: string | null,
    tom: string | null,
  },
  land: string[],
}
interface OpprettDto {
  brukerID: string,
  sakstype: string,
  behandlingstema: string,
  soknadDto: SoknadDto,
  skalTilordnes: boolean,
  oppgaveID: string,
}
export const opprett = (body: OpprettDto) => postAsJson(`${API_BASE_URL}${FAGSAKER}/opprett`, body);

interface HenleggDto {
  begrunnelseKode: string,
  fritekst: string | null,
}
export const henlegg = (snr: number, body: HenleggDto) => postAsJson(`${API_BASE_URL}${FAGSAKER}/${snr}/henlegg`, body);

export const bortfall = (snr: number) => putAsText(`${API_BASE_URL}${FAGSAKER}/${snr}/avsluttsaksombortfalt`);

interface VideresendDto {
  mottakerinstitusjon: string | null,
  fritekst: string | null,
}
export const videresend = (snr: number, body: VideresendDto) => postAsJson(`${API_BASE_URL}${FAGSAKER}/${snr}/henlegg-videresend`, body);

export const avslutt = (snr: number) => putAsText(`${API_BASE_URL}${FAGSAKER}/${snr}/avslutt`);

interface UtpekDto {
  mottakerinstitusjoner: string[],
  fritekstSed: string | null,
  fritekstBrev: string | null,
}
export const utpek = (snr: number, body: UtpekDto) => postAsJson(`${API_BASE_URL}${FAGSAKER}/${snr}/utpek`, body);

export const revurder = (snr: number) => postAsJson(`${API_BASE_URL}${FAGSAKER}/${snr}/revurder`, {});
