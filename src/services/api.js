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
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL ? `${process.env.REACT_APP_API_BASE_URL}`: null;
//console.log('process.env', process.env);

function makeRestUri(args, endpoint) {
  // API_BASE_URL is configured in .env || .env.local, and injected by webpack
  if (API_BASE_URL) {
    return `${API_BASE_URL}${endpoint}`;
  }
  // Run by mocha, runner. and does NOT read .env and inject API_BASE_URL
  const mock_env = args[args.length - 1];
  const { host, port } = mock_env;
  return `${host}:${port}/api/${endpoint}`;
}

export function hentSoknader(bid) {
  const args = [...arguments];
  const URI_SOKNADER = makeRestUri(args, `soknader/${bid}`);
  return getAsJson(URI_SOKNADER);
}

export function sendSoknad(bid, soknad) {
  const args = [...arguments];
  const URI_SOKNADER = makeRestUri(args, `soknader/${bid}`);
  return postAsJson(URI_SOKNADER, soknad);
}

export function hentFaktaavklaring(bid) {
  const args = [...arguments];
  const URI_FAKTAAVKLARING = makeRestUri(args, `faktaavklaring/${bid}`);
  return getAsJson(URI_FAKTAAVKLARING);
}

export function sendFaktaavklaring(bid, dokument) {
  const args = [...arguments];
  const URI_FAKTAAVKLARING = makeRestUri(args, `faktaavklaring/${bid}`);
  return postAsJson(URI_FAKTAAVKLARING, dokument);
}

export function hentVurdering(bid) {
  const args = [...arguments];
  const URI_VURDERING = makeRestUri(args, `vurdering/${bid}`);
  return getAsJson(URI_VURDERING);
}

export function hentFagsaker(snr) {
  const args = [...arguments];
  const URI_FAGSAKER = makeRestUri(args, `fagsaker/${snr}`);
  return getAsJson(URI_FAGSAKER);
}

export function hentNyesaker(fnr) {
  const args = [...arguments];
  const URI_NYESAKER = makeRestUri(args, `sok/fagsaker/?fnr=${fnr}`);
  return getAsJson(URI_NYESAKER);
}

export function opprettSak(fnr) {
  const args = [...arguments];
  const URI_OPPRETTSAK = makeRestUri(args, `opprettsak/${fnr}`);
  return getAsJson(URI_OPPRETTSAK);
}

export function hentSakerbehandles(brukernavn) {
  const args = [...arguments];
  const URI_SAKERBEHANDLES = makeRestUri(args, `sakerbehandles/${brukernavn}`);
  return getAsJson(URI_SAKERBEHANDLES);
}
export function hentTidligeresaker(brukernavn) {
  const args = [...arguments];
  const URI_TIDLIGERESAKER = makeRestUri(args, `tidligeresaker/${brukernavn}`);
  return getAsJson(URI_TIDLIGERESAKER);
}
export function hentSaksbehandler() {
  const args = [...arguments];
  const URI_SAKSBEHANDLER = makeRestUri(args, 'saksbehandler');
  return getAsJson(URI_SAKSBEHANDLER);
}

export function hentLandkoder() {
  const args = [...arguments];
  const URI_LANDKODER = makeRestUri(args, 'landkoder');
  return getAsJson(URI_LANDKODER);
}

export function nyHenvendelse(henvendelse) {
  const args = [...arguments];
  const URI_HENVENDELSE = makeRestUri(args, 'henvendelse');
  return postAsJson(URI_HENVENDELSE, henvendelse);
}
