import { postAsJson, getAsJson } from '../utils';
import { API_BASE_URL, ANMODNINGSPERIODER, SVAR } from '../api-constants';

export const send = (behandlingID, body) => {
  const URI_ANMODNINGSPERIODER = `${API_BASE_URL}${ANMODNINGSPERIODER}/${behandlingID}`;
  return postAsJson(URI_ANMODNINGSPERIODER, body);
};

export const hent = behandlingID => {
  const URI_ANMODNINGSPERIODER = `${API_BASE_URL}${ANMODNINGSPERIODER}/${behandlingID}`;
  return getAsJson(URI_ANMODNINGSPERIODER);
};

export const hentSvar = anmodningsperiodeID => {
  const URI_ANMODNINGSPERIODE_SVAR = `${API_BASE_URL}${ANMODNINGSPERIODER}/${anmodningsperiodeID}/${SVAR}`;
  return getAsJson(URI_ANMODNINGSPERIODE_SVAR);
};

export const sendSvar = (anmodningsperiodeID, body) => {
  const URI_ANMODNINGSPERIODE_SVAR = `${API_BASE_URL}${ANMODNINGSPERIODER}/${anmodningsperiodeID}/${SVAR}`;
  return postAsJson(URI_ANMODNINGSPERIODE_SVAR, body);
};
