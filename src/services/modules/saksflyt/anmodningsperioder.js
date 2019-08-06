import { postAsJson } from '../../utils';
import { API_BASE_URL, SAKSFLYT, ANMODNINGSPERIODER } from '../../api-constants';

export const bestill = (behandlingID, body) => {
  const URI_SAKSFLYT_ANMODNINGSPERIODER = `${API_BASE_URL}${SAKSFLYT}/${ANMODNINGSPERIODER}/${behandlingID}`;
  return postAsJson(URI_SAKSFLYT_ANMODNINGSPERIODER, body);
};
