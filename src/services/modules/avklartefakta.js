import { getAsJson, postAsJson } from '../utils';
import { API_BASE_URL, AVKLARTEFAKTA } from '../api-constants';

async function hent(bid) {
  const URI_AVKLARTEFAKTA = `${API_BASE_URL}${AVKLARTEFAKTA}/${bid}`;
  return getAsJson(URI_AVKLARTEFAKTA);
}

async function send(bid, dokument) {
  const URI_AVKLARTEFAKTA = `${API_BASE_URL}${AVKLARTEFAKTA}/${bid}`;
  return postAsJson(URI_AVKLARTEFAKTA, dokument);
}

export {
  hent,
  send,
};
