import { postAsJson } from '../utils';
import { API_BASE_URL } from '../api-constants';

// eslint-disable-next-line import/prefer-default-export
export async function lagre(bid, body) {
  const URI_VEDTAK = `${API_BASE_URL}vedtak/${bid}`;
  return postAsJson(URI_VEDTAK, body);
}
