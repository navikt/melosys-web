import { getAsJson, postAsJson } from '../utils';
import { API_BASE_URL } from '../api-constants';

const endepunkt = 'avklartefakta';

async function hent(bid) {
  const URI_AVKLARTEFAKTA = `${API_BASE_URL}${endepunkt}/${bid}`;
  return getAsJson(URI_AVKLARTEFAKTA);
}

async function send(bid, dokument) {
  const URI_AVKLARTEFAKTA = `${API_BASE_URL}${endepunkt}/${bid}`;
  return postAsJson(URI_AVKLARTEFAKTA, dokument);
}

export {
  hent,
  send,
};
