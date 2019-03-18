import { API_BASE_URL, SOKNADER } from '../api-constants';

import { getAsJson, postAsJson } from '../utils';


export const hent = bid => {
  const URI_SOKNADER = `${API_BASE_URL}${SOKNADER}/${bid}`;
  return getAsJson(URI_SOKNADER);
};

export const send = (bid, soknad) => {
  const URI_SOKNAD = `${API_BASE_URL}${SOKNADER}/${bid}`;
  return postAsJson(URI_SOKNAD, soknad);
};
