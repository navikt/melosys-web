import { API_BASE_URL } from '../api-constants';

import { getAsJson, postAsJson } from '../utils';


function hentSoknader(bid) {
  const URI_SOKNADER = `${API_BASE_URL}soknader/${bid}`;
  return getAsJson(URI_SOKNADER);
}

function sendSoknad(bid, soknad) {
  const URI_SOKNAD = `${API_BASE_URL}soknader/${bid}`;
  return postAsJson(URI_SOKNAD, soknad);
}

export {
  hentSoknader,
  sendSoknad,
};
