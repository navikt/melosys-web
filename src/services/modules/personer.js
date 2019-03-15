import { API_BASE_URL, PERSONER } from '../api-constants';

import { cachedGetAsJson } from '../utils';

// eslint-disable-next-line import/prefer-default-export
export async function hentPerson(fnrdnr) {
  const URI_PERSON = `${API_BASE_URL}${PERSONER}/?fnr=${fnrdnr}`;
  return cachedGetAsJson(URI_PERSON);
}

