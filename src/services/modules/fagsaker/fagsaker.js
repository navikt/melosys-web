import { getAsJson, postAsJson } from '../../utils';
import { API_BASE_URL, FAGSAKER } from '../../api-constants';

async function hent(snr) {
  const URI_FAGSAKER = `${API_BASE_URL}${FAGSAKER}/${snr}`;
  return getAsJson(URI_FAGSAKER);
}

async function sok(fnr) {
  const URI_FAGSAKER = `${API_BASE_URL}${FAGSAKER}/sok/?fnr=${fnr}`;
  return getAsJson(URI_FAGSAKER);
}
async function opprett(fnr) {
  const URI_OPPRETTSAK = `${API_BASE_URL}${FAGSAKER}/ny/${fnr}`;
  return getAsJson(URI_OPPRETTSAK);
}

async function henlegg(snr, body) {
  const URI_HENLEGGSAK = `${API_BASE_URL}${FAGSAKER}/${snr}/henlegg`;
  return postAsJson(URI_HENLEGGSAK, body);
}

export {
  hent,
  sok,
  opprett,
  henlegg,
};
