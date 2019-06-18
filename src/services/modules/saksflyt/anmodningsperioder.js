import { postAsJson, getAsJson } from '../../utils';
import { API_BASE_URL, SAKSFLYT, ANMODNINGSPERIODER } from '../../api-constants';

export const send = (behandlingID, body) => {
  const URI_SAKSFLYT_ANMODNINGSPERIODER = `${API_BASE_URL}${SAKSFLYT}/${ANMODNINGSPERIODER}/${behandlingID}`;
  return postAsJson(URI_SAKSFLYT_ANMODNINGSPERIODER, body);
};

export const hent = behandlingID => {
  const URI_SAKSFLYT_ANMODNINGSPERIODER = `${API_BASE_URL}${SAKSFLYT}/${ANMODNINGSPERIODER}/${behandlingID}`;
  return getAsJson(URI_SAKSFLYT_ANMODNINGSPERIODER);
};
