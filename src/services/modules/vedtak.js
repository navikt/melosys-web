import { postAsJson } from '../utils';
import { API_BASE_URL } from '../api-constants';

// eslint-disable-next-line import/prefer-default-export
export async function fatte(bid, body) {
  const URI_FATTE_VEDTAK = `${API_BASE_URL}vedtak/${bid}`;
  return postAsJson(URI_FATTE_VEDTAK, body);
}
