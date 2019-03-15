import { API_BASE_URL, INNGANG } from '../api-constants';

import { getAsJson } from '../utils';

// eslint-disable-next-line import/prefer-default-export
export async function hent(snr) {
  const URI_INNGANG = `${API_BASE_URL}${INNGANG}/${snr}`;
  return getAsJson(URI_INNGANG);
}

