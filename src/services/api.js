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

export function hentKodeverk() {
  const URI_KODEVERK = `${API_BASE_URL}kodeverk`;
  return getAsJson(URI_KODEVERK);
}

export function hentMineSaker() {
  const URI_OPPGAVER_MINESAKER = `${API_BASE_URL}oppgaver/oversikt`;
  return getAsJson(URI_OPPGAVER_MINESAKER);
}
export function sendPlukkOppgave(oppgave) {
  const URI_OPPGAVER_PLUKK = `${API_BASE_URL}oppgaver/plukk`;
  return postAsJson(URI_OPPGAVER_PLUKK, oppgave);
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

export function hentNyesaker(fnr) {
  const URI_NYESAKER = `${API_BASE_URL}sok/fagsaker/?fnr=${fnr}`;
  return getAsJson(URI_NYESAKER);
}

export function opprettNyFagsak(fnr) {
  const URI_OPPRETTSAK = `${API_BASE_URL}fagsaker/ny/${fnr}`;
  return getAsJson(URI_OPPRETTSAK);
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

export function hentLandkoder() {
  const URI_LANDKODER = `${API_BASE_URL}landkoder`;
  return getAsJson(URI_LANDKODER);
}
