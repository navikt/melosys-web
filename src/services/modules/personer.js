import { API_BASE_URL } from '../api-constants';

import { cachedGetAsJson } from '../utils';

// eslint-disable-next-line import/prefer-default-export
export async function hentPerson(fnrdnr) {
  const URI_PERSON = `${API_BASE_URL}personer/?fnr=${fnrdnr}`;
  return cachedGetAsJson(URI_PERSON);
}

