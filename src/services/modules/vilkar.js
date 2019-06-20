import { getAsJson, postAsJson } from '../utils';
import { API_BASE_URL, VILKAAR } from '../api-constants';

// eslint-disable-next-line import/prefer-default-export
export const hent = behandlingID => {
  const URI_VURDERING = `${API_BASE_URL}${VILKAAR}/${behandlingID}`;
  return getAsJson(URI_VURDERING);
};

export const send = (behandlingID, body) => {
  const URI_VURDERING = `${API_BASE_URL}${VILKAAR}/${behandlingID}`;
  return postAsJson(URI_VURDERING, body);
};
