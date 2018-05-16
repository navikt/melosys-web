import { getAsJson, postAsJson } from '../utils';
import { API_BASE_URL } from '../api-constants';

const endepunkt = 'faktaavklaring';

function hent(bid) {
  const URI_FAKTAAVKLARING = `${API_BASE_URL}${endepunkt}/${bid}`;
  return getAsJson(URI_FAKTAAVKLARING);
}

function send(bid, dokument) {
  const URI_FAKTAAVKLARING = `${API_BASE_URL}${endepunkt}/${bid}`;
  return postAsJson(URI_FAKTAAVKLARING, dokument);
}

function bosted(bid, data) {
  const URI_FAKTAAVKLARING_BOSTED = `${API_BASE_URL}${endepunkt}/bosted/${bid}`;
  return postAsJson(URI_FAKTAAVKLARING_BOSTED, data);
}
export {
  hent,
  send,
  bosted,
};
