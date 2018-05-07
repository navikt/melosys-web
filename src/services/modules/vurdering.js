import { getAsJson } from '../utils';
import { API_BASE_URL } from '../api-constants';

// eslint-disable-next-line import/prefer-default-export
export function hentVurdering(bid) {
  const URI_VURDERING = `${API_BASE_URL}vurdering/${bid}`;
  return getAsJson(URI_VURDERING);
}
