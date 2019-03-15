import { getAsJson, postAsJson } from '../utils';
import { API_BASE_URL, OPPGAVER } from '../api-constants';

async function oversikt() {
  const URI_OPPGAVER_MINESAKER = `${API_BASE_URL}${OPPGAVER}/oversikt`;
  return getAsJson(URI_OPPGAVER_MINESAKER);
}
async function send(oppgave) {
  const URI_OPPGAVER_PLUKK = `${API_BASE_URL}${OPPGAVER}/plukk`;
  return postAsJson(URI_OPPGAVER_PLUKK, oppgave);
}
async function opprett(oppgave) {
  const URI_OPPGAVER_OPPRETT = `${API_BASE_URL}${OPPGAVER}/opprett`;
  return postAsJson(URI_OPPGAVER_OPPRETT, oppgave);
}
async function sparkReset() {
  const URI_RESET = `${API_BASE_URL}${OPPGAVER}/reset`;
  return getAsJson(URI_RESET);
}
async function tilbakelegge(oppgave) {
  const URI_TILBAKELEGGE = `${API_BASE_URL}${OPPGAVER}/tilbakelegge`;
  return postAsJson(URI_TILBAKELEGGE, oppgave);
}
export {
  oversikt,
  send,
  opprett,
  sparkReset,
  tilbakelegge,
};
