import { getAsJson } from '../utils';
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

function oppfrisk(behandlingID) {
  const URI_OPPFRISKSAK = `${API_BASE_URL}fagsaker/oppfrisk/${behandlingID}`;
  return getAsJson(URI_OPPFRISKSAK);
}

export {
  hent,
  sok,
  opprett,
  oppfrisk,
};
