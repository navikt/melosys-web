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
// console.log('process.env', process.env);

export function hentSoknader(bid) {
  const URI_SOKNADER = `${API_BASE_URL}soknader/${bid}`;
  return getAsJson(URI_SOKNADER);
}
export function hentSoknaderPact(host, port, bid) {
  const URI_SOKNADER = `${host}:${port}/api/soknader/${bid}`;
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
export function hentFaktaavklaringPact(host, port, bid) {
  const URI_FAKTAAVKLARING = `${host}:${port}/api/faktaavklaring/${bid}`;
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
export function hentVurderingPact(host, port, bid) {
  const URI_VURDERING = `${host}:${port}/api/vurdering/${bid}`;
  return getAsJson(URI_VURDERING);
}

export function hentFagsaker(snr) {
  const URI_FAGSAKER = `${API_BASE_URL}fagsaker/${snr}`;
  return getAsJson(URI_FAGSAKER);
}

export function hentFagsakerPact(host, port, snr) {
  const URI_FAGSAKER = `${host}:${port}/api/fagsaker/${snr}`;
  return getAsJson(URI_FAGSAKER);
}

export function hentNyesaker(fnr) {
  const URI_NYESAKER = `${API_BASE_URL}sok/fagsaker/?fnr=${fnr}`;
  return getAsJson(URI_NYESAKER);
}

export function hentNyesakerPact(host, port, fnr) {
  const URI_NYESAKER = `${host}:${port}/api/sok/fagsaker/?fnr=${fnr}`;
  return getAsJson(URI_NYESAKER);
}

export function opprettSak(fnr) {
  const URI_OPPRETTSAK = `${API_BASE_URL}opprettsak/${fnr}`;
  return postAsJson(URI_OPPRETTSAK);
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
export function hentSaksbehandlerPact(host, port) {
  const URI_SAKSBEHANDLER = `${host}:${port}/api/saksbehandler`;
  return getAsJson(URI_SAKSBEHANDLER);
}

export function hentLandkoder() {
  const URI_LANDKODER = `${API_BASE_URL}landkoder`;
  return getAsJson(URI_LANDKODER);
}

export function hentLandkoderPact(host, port) {
  const URI_LANDKODER = `${host}:${port}/api/landkoder`;
  return getAsJson(URI_LANDKODER);
}
export function nyHenvendelse(henvendelse) {
  const URI_HENVENDELSE =`${API_BASE_URL}henvendelse/`;
  return postAsJson(URI_HENVENDELSE, henvendelse);
}
