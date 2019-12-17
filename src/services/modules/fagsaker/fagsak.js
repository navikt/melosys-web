import { getAsJson, postAsJson, putAsText } from '../../utils';
import { API_BASE_URL, FAGSAKER } from '../../api-constants';

export const hent = snr => getAsJson(`${API_BASE_URL}${FAGSAKER}/${snr}`);
export const opprett = fnr => getAsJson(`${API_BASE_URL}${FAGSAKER}/ny/${fnr}`);
export const henlegg = (snr, body) => postAsJson(`${API_BASE_URL}${FAGSAKER}/${snr}/henlegg`, body);
export const bortfall = snr => putAsText(`${API_BASE_URL}${FAGSAKER}/${snr}/avsluttsaksombortfalt`);
export const videresend = (snr, body) => postAsJson(`${API_BASE_URL}${FAGSAKER}/${snr}/henlegg-videresend`, body);
export const avslutt = snr => putAsText(`${API_BASE_URL}${FAGSAKER}/${snr}/avslutt`);
