import { getAsJson, postAsJson } from '../utils';
import { API_BASE_URL, VILKAAR } from '../api-constants';

// eslint-disable-next-line import/prefer-default-export
export async function hent(bid) {
  const URI_VURDERING = `${API_BASE_URL}${VILKAAR}/${bid}`;
  return getAsJson(URI_VURDERING);
}

export async function send(bid, body) {
  const URI_VURDERING = `${API_BASE_URL}${VILKAAR}/${bid}`;
  return postAsJson(URI_VURDERING, body);
}
