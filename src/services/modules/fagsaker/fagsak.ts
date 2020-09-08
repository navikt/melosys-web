import { getAsJson, postAsJson, putAsText } from '../../utils';
import { API_BASE_URL, FAGSAKER } from '../../api-constants';

export const hent = (saksnummer: string) => getAsJson(`${API_BASE_URL}${FAGSAKER}/${saksnummer}`);

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
export const henlegg = (saksnummer: string, body: HenleggDto) => postAsJson(`${API_BASE_URL}${FAGSAKER}/${saksnummer}/henlegg`, body);

export const bortfall = (saksnummer: string) => putAsText(`${API_BASE_URL}${FAGSAKER}/${saksnummer}/avsluttsaksombortfalt`);

interface VideresendDto {
  mottakerinstitusjon: string | null,
  fritekst: string | null,
}
export const videresend = (saksnummer: string, body: VideresendDto) => postAsJson(`${API_BASE_URL}${FAGSAKER}/${saksnummer}/henlegg-videresend`, body);

export const avslutt = (saksnummer: string) => putAsText(`${API_BASE_URL}${FAGSAKER}/${saksnummer}/avslutt`);

interface UtpekDto {
  mottakerinstitusjoner: string[],
  fritekstSed: string | null,
  fritekstBrev: string | null,
}
export const utpek = (saksnummer: string, body: UtpekDto) => postAsJson(`${API_BASE_URL}${FAGSAKER}/${saksnummer}/utpek`, body);

export const revurder = (saksnummer: string) => postAsJson(`${API_BASE_URL}${FAGSAKER}/${saksnummer}/revurder`, {});
