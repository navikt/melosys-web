import { API_BASE_URL } from '../api-constants';

import { getAsJson } from '../utils';

// eslint-disable-next-line import/prefer-default-export
export async function hent(snr) {
  const URI_INNGANG = `${API_BASE_URL}inngang/${snr}`;
  return getAsJson(URI_INNGANG);
}

