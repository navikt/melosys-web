import { postAsJson, getAsJson } from '../utils';
import { API_BASE_URL, ANMODNINGSPERIODER, SVAR } from '../api-constants';

export const send = (behandlingID, body) => postAsJson(`${API_BASE_URL}${ANMODNINGSPERIODER}/${behandlingID}`, body);

export const hent = behandlingID => getAsJson(`${API_BASE_URL}${ANMODNINGSPERIODER}/${behandlingID}`);

export const hentSvar = anmodningsperiodeID => getAsJson(`${API_BASE_URL}${ANMODNINGSPERIODER}/${anmodningsperiodeID}/${SVAR}`);

export const sendSvar = (anmodningsperiodeID, body) => postAsJson(`${API_BASE_URL}${ANMODNINGSPERIODER}/${anmodningsperiodeID}/${SVAR}`, body);
