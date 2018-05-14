import { getAsJson, postAsJson } from '../utils';
import { API_BASE_URL } from '../api-constants';

function hent(snr) {
  const URI_FAGSAKER = `${API_BASE_URL}fagsaker/${snr}`;
  return getAsJson(URI_FAGSAKER);
}

function sok(fnr) {
  const URI_FAGSAKER = `${API_BASE_URL}fagsaker/sok/?fnr=${fnr}`;
  return getAsJson(URI_FAGSAKER);
}
function opprett(fnr) {
  const URI_OPPRETTSAK = `${API_BASE_URL}fagsaker/ny/${fnr}`;
  return getAsJson(URI_OPPRETTSAK);
}

function send(data) {
  const URI_SEND_NY_FAGSAK_TIL_JOURNALFORING = `${API_BASE_URL}fagsaker/journalforing`;
  return postAsJson(URI_SEND_NY_FAGSAK_TIL_JOURNALFORING, data);
}

export {
  hent,
  sok,
  opprett,
  send,
};
