import { cachedGetAsJson } from '../utils';
import { API_BASE_URL } from '../api-constants';

// eslint-disable-next-line import/prefer-default-export
export function hent() {
  const URI_KODEVERK = `${API_BASE_URL}kodeverk`;
  const hrs6 = 60 * 60 * 6;
  return cachedGetAsJson(URI_KODEVERK, hrs6);
}
