import { postAsJson } from '../utils';
import { API_BASE_URL, VEDTAK } from '../api-constants';

// eslint-disable-next-line import/prefer-default-export
export async function fatte(bid, body) {
  const URI_FATTE_VEDTAK = `${API_BASE_URL}${VEDTAK}/${bid}`;
  return postAsJson(URI_FATTE_VEDTAK, body);
}

export async function endrePeriode(bid, body) {
  const URI_ENDRE_PERIODE = `${API_BASE_URL}${VEDTAK}/endre/${bid}`;
  return postAsJson(URI_ENDRE_PERIODE, body);
}
