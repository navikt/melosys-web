/* eslint-disable */
import { getAsJson, postAsJson } from './utils';

/*
function erDev() {
  const url = window.location.href;
  return url.includes('debug=true') ||  url.includes('localhost:');
  return false;
  //from .env or .env.local
  return process.env.NODE_ENV !== 'production';
}
*/
// from .env or .env.local
const API_BASE_URL = `${process.env.REACT_APP_API_BASE_URL}`;
//console.log('process.env', process.env);

export function health() {
  const URI_HEALTH = `/melosys/internal/health/`;
  return getAsJson(URI_HEALTH);
}

export function hentPerson(fnrdnr) {
  const URI_PERSON = `${API_BASE_URL}person?fnr=${fnrdnr}`;
  return getAsJson(URI_PERSON);
}

export function hentOrganisasjon(orgnr) {
  const URI_ORGANISASJON = `${API_BASE_URL}organisasjon?orgnr=${orgnr}`;
  return getAsJson(URI_ORGANISASJON);
}
export function hentKodeverk() {
  const URI_KODEVERK = `${API_BASE_URL}kodeverk`;
  return getAsJson(URI_KODEVERK);
}

export function hentOppgaveOversikt() {
  const URI_OPPGAVER_MINESAKER = `${API_BASE_URL}oppgaver/oversikt`;
  return getAsJson(URI_OPPGAVER_MINESAKER);
}
export function sendPlukkOppgave(oppgave) {
  const URI_OPPGAVER_PLUKK = `${API_BASE_URL}oppgaver/plukk`;
  return postAsJson(URI_OPPGAVER_PLUKK, oppgave);
}
export function hentJournalOppgave(journalpostID) {
  const URI_JOURNALFORING_OPPGAVE = `${API_BASE_URL}journalforing/${journalpostID}`;
  return getAsJson(URI_JOURNALFORING_OPPGAVE);
}

export function hentSoknader(bid) {
  const URI_SOKNADER = `${API_BASE_URL}soknader/${bid}`;
  return getAsJson(URI_SOKNADER);
}

export function sendSoknad(bid, soknad) {
  const URI_SOKNAD =`${API_BASE_URL}soknader/${bid}`;
  return postAsJson(URI_SOKNAD, soknad);
}

export function hentFaktaavklaring(bid) {
  const URI_FAKTAAVKLARING = `${API_BASE_URL}faktaavklaring/${bid}`;
  return getAsJson(URI_FAKTAAVKLARING);
}

export function sendFaktaavklaring(bid, dokument) {
  const URI_FAKTAAVKLARING =`${API_BASE_URL}faktaavklaring/${bid}`;
  return postAsJson(URI_FAKTAAVKLARING, dokument);
}

export function hentVurdering(bid) {
  const URI_VURDERING = `${API_BASE_URL}vurdering/${bid}`;
  return getAsJson(URI_VURDERING);
}

export function hentFagsaker(snr) {
  const URI_FAGSAKER = `${API_BASE_URL}fagsaker/${snr}`;
  return getAsJson(URI_FAGSAKER);
}

export function hentBehandlingsOppgaver(fnr) {
  const URI_NYESAKER = `${API_BASE_URL}oppgaver/sok/?fnr=${fnr}`;
  return getAsJson(URI_NYESAKER);
}

export function opprettNyFagsak(fnr) {
  const URI_OPPRETTSAK = `${API_BASE_URL}fagsaker/ny/${fnr}`;
  return getAsJson(URI_OPPRETTSAK);
}

export function sendNyFagsakTilJournalforing(data) {
  const URI_SEND_NY_FAGSAK_TIL_JOURNALFORING = `${API_BASE_URL}fagsaker/journalforing`;
  return postAsJson(URI_SEND_NY_FAGSAK_TIL_JOURNALFORING, data);
}
export function hentSakerbehandles(brukernavn) {
  const URI_SAKERBEHANDLES = `${API_BASE_URL}sakerbehandles/${brukernavn}`;
  return getAsJson(URI_SAKERBEHANDLES);
}

export function hentTidligeresaker(brukernavn) {
  const URI_TIDLIGERESAKER = `${API_BASE_URL}tidligeresaker/${brukernavn}`;
  return getAsJson(URI_TIDLIGERESAKER);
}

export function hentSaksbehandler() {
  const URI_SAKSBEHANDLER = `${API_BASE_URL}saksbehandler`;
  return getAsJson(URI_SAKSBEHANDLER);
}

