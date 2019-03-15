import { getAsJson, postAsJson } from '../utils';
import { API_BASE_URL, AVKLARTEFAKTA } from '../api-constants';

export const hent = async bid => {
  const URI_AVKLARTEFAKTA = `${API_BASE_URL}${AVKLARTEFAKTA}/${bid}`;
  return getAsJson(URI_AVKLARTEFAKTA);
};

export const send = async (bid, dokument) => {
  const URI_AVKLARTEFAKTA = `${API_BASE_URL}${AVKLARTEFAKTA}/${bid}`;
  return postAsJson(URI_AVKLARTEFAKTA, dokument);
};
