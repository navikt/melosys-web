/* eslint-disable */
import { getAsJson, postAsJson } from './utils';

/*
function erDev() {
  const url = window.location.href;
  return url.includes('debug=true') ||  url.includes('localhost:');
  return false;
  //from .env or .env.local
  return process.env.NODE_PATH !== 'production';
}
*/
// from .env or .env.local
const API_SERVER = `${process.env.REACT_APP_API_SERVER}`;
const API_BASE_URL = `${process.env.REACT_APP_API_BASE_URL}`;
const API_MELOSYS_URL = `${API_SERVER}${API_BASE_URL}`;
const API_SAKSBEHANDLER = `${process.env.REACT_APP_API_SAKSBEHANDLER}`;
const API_SAKSOPPLYSNINGER = `${process.env.REACT_APP_API_SAKSOPPLYSNINGER}`;
console.log('process.env', process.env);

export function health() {
  const URI_HEALTH = `/melosys/internal/health`;
  return getAsJson(URI_HEALTH);
}

export function hentSoknad() {
  const URI_SOKNAD =  `${API_MELOSYS_URL}soknad/`;
  return getAsJson(URI_SOKNAD);
}

export function sendSoknad(dokument) {
  const URI_SOKNAD =`${API_MELOSYS_URL}soknad`;
  return postAsJson(URI_SOKNAD, dokument);
}

export function hentFagsaker(snr) {
  const URI_FAGSAKER =  `${API_MELOSYS_URL}fagsaker/${snr}`;
  return getAsJson(URI_FAGSAKER);
}

export function hentNyesaker(fnr) {
  const URI_NYESAKER = `${API_MELOSYS_URL}sok/fagsaker/?fnr=${fnr}`;
  return getAsJson(URI_NYESAKER);
}

export function opprettSak(fnr) {
  const URI_OPPRETTSAK = `${API_MELOSYS_URL}opprettsak/${fnr}`;
  return postAsJson(URI_OPPRETTSAK);
}

export function hentSakerbehandles(brukernavn) {
  const URI_SAKERBEHANDLES = `${API_MELOSYS_URL}sakerbehandles/${brukernavn}`;
  return getAsJson(URI_SAKERBEHANDLES);
}

export function hentTidligeresaker(brukernavn) {
  const URI_TIDLIGERESAKER = `${API_MELOSYS_URL}tidligeresaker/${brukernavn}`;
  return getAsJson(URI_TIDLIGERESAKER);
}

export function hentSaksbehandler() {
  const URI_SAKSBEHANDLER = `${API_BASE_URL}${API_SAKSBEHANDLER}`;
  return getAsJson(URI_SAKSBEHANDLER);
}

export function hentSaksopplysninger(fnr) {
  const URI_SAMMENSATT_ARBEIDSFORHOLD = `${API_MELOSYS_URL}${API_SAKSOPPLYSNINGER}/${fnr}`;
  return getAsJson(URI_SAMMENSATT_ARBEIDSFORHOLD);
}

export function nyHenvendelse(henvendelse) {
  const URI_HENVENDELSE =`${API_MELOSYS_URL}henvendelse`;
  return postAsJson(URI_HENVENDELSE, henvendelse);
}
