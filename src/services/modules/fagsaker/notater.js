import { getAsJson, postAsJson, putAsJson } from '../../utils';
import { API_BASE_URL, FAGSAKER, NOTATER } from '../../api-constants';

export const hent = saksnr => getAsJson(`${API_BASE_URL}${FAGSAKER}/${saksnr}/${NOTATER}`);

export const opprett = (saksnr, data) => postAsJson(`${API_BASE_URL}${FAGSAKER}/${saksnr}/${NOTATER}`, data);

export const oppdater = (saksnr, notatID, data) => putAsJson(`${API_BASE_URL}${FAGSAKER}/${saksnr}/${NOTATER}/${notatID}`, data);
