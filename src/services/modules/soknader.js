import { API_BASE_URL } from '../api-constants';

import { getAsJson, postAsJson } from '../utils';


async function hent(bid) {
  const URI_SOKNADER = `${API_BASE_URL}soknader/${bid}`;
  return getAsJson(URI_SOKNADER);
}

async function send(bid, soknad) {
  const URI_SOKNAD = `${API_BASE_URL}soknader/${bid}`;
  return postAsJson(URI_SOKNAD, soknad);
}

export {
  hent,
  send,
};
