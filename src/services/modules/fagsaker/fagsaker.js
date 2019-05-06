import { getAsJson, postAsJson } from '../../utils';
import { API_BASE_URL, FAGSAKER } from '../../api-constants';

export const hent = snr => {
  const URI_FAGSAKER = `${API_BASE_URL}${FAGSAKER}/${snr}`;
  return getAsJson(URI_FAGSAKER);
};

export const sok = fnr => {
  const URI_FAGSAKER = `${API_BASE_URL}${FAGSAKER}/sok/?fnr=${fnr}`;
  return getAsJson(URI_FAGSAKER);
};
export const opprett = fnr => {
  const URI_OPPRETTSAK = `${API_BASE_URL}${FAGSAKER}/ny/${fnr}`;
  return getAsJson(URI_OPPRETTSAK);
};

export const henlegg = (snr, body) => {
  const URI_HENLEGGSAK = `${API_BASE_URL}${FAGSAKER}/${snr}/henlegg`;
  return postAsJson(URI_HENLEGGSAK, body);
};

export const bortfall = snr => {
  const URI_AVSLUTTSAKSOMBORTFALL = `${API_BASE_URL}${FAGSAKER}/${snr}/henlegg`;
  return postAsJson(URI_AVSLUTTSAKSOMBORTFALL);
};
