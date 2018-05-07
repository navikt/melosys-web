import { getAsJson, postAsJson } from '../utils';
import { API_BASE_URL } from '../api-constants';

function hentOppgaveOversikt() {
  const URI_OPPGAVER_MINESAKER = `${API_BASE_URL}oppgaver/oversikt`;
  return getAsJson(URI_OPPGAVER_MINESAKER);
}
function sendPlukkOppgave(oppgave) {
  const URI_OPPGAVER_PLUKK = `${API_BASE_URL}oppgaver/plukk`;
  return postAsJson(URI_OPPGAVER_PLUKK, oppgave);
}
function hentBehandlingsOppgaver(fnr) {
  const URI_BEHANDLINGS_OPPGAVER = `${API_BASE_URL}oppgaver/sok/?fnr=${fnr}`;
  return getAsJson(URI_BEHANDLINGS_OPPGAVER);
}

function sparkResetOppgaver() {
  const URI_RESET = `${API_BASE_URL}oppgaver/reset`;
  return getAsJson(URI_RESET);
}
export {
  hentOppgaveOversikt,
  sendPlukkOppgave,
  hentBehandlingsOppgaver,
  sparkResetOppgaver,
};
