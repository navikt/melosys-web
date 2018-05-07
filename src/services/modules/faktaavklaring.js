import { getAsJson, postAsJson } from '../utils';
import { API_BASE_URL } from '../api-constants';

function hentFaktaavklaring(bid) {
  const URI_FAKTAAVKLARING = `${API_BASE_URL}faktaavklaring/${bid}`;
  return getAsJson(URI_FAKTAAVKLARING);
}

function sendFaktaavklaring(bid, dokument) {
  const URI_FAKTAAVKLARING = `${API_BASE_URL}faktaavklaring/${bid}`;
  return postAsJson(URI_FAKTAAVKLARING, dokument);
}

export {
  hentFaktaavklaring,
  sendFaktaavklaring,
};
