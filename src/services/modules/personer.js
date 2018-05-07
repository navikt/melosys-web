import { API_BASE_URL } from '../api-constants';

import { getAsJson } from '../utils';

// eslint-disable-next-line import/prefer-default-export
export function hentPerson(fnrdnr) {
  const URI_PERSON = `${API_BASE_URL}personer/?fnr=${fnrdnr}`;
  return getAsJson(URI_PERSON);
}

