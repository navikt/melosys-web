import { getAsJson } from '../utils';
import { API_BASE_URL } from '../api-constants';

// eslint-disable-next-line import/prefer-default-export
export function hentKodeverk() {
  const URI_KODEVERK = `${API_BASE_URL}kodeverk`;
  return getAsJson(URI_KODEVERK);
}
