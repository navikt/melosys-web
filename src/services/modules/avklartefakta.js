import { getAsJson, postAsJson } from '../utils';
import { API_BASE_URL, AVKLARTEFAKTA } from '../api-constants';

export const hent = behandlingID => {
  const URI_AVKLARTEFAKTA = `${API_BASE_URL}${AVKLARTEFAKTA}/${behandlingID}`;
  return getAsJson(URI_AVKLARTEFAKTA);
};

export const send = (behandlingID, dokument) => {
  const URI_AVKLARTEFAKTA = `${API_BASE_URL}${AVKLARTEFAKTA}/${behandlingID}`;
  return postAsJson(URI_AVKLARTEFAKTA, dokument);
};
