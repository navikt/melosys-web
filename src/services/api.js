/* eslint-disable */
import { fetchToJson, postAsJson } from './utils';

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
/*
const API_MELOSYS_URL = 'http://a34apvl00025:3002/melosys/api/';
const API_SAKSBEHANDLER = 'saksbehandler';
const API_SAKSOPPLYSNINGER = 'arbeidsforhold';
*/
console.log('process.env', process.env);

const headers = new Headers({
  Accept: 'application/json',
  'Accept-Charset': 'utf-8',
});

export function hentSoknad() {
  const URI_SOKNAD =  `${API_MELOSYS_URL}soknad/`;
  return fetchToJson(URI_SOKNAD, { headers: headers });
}

export function sendSoknad(dokument) {
  const URI_SOKNAD =`${API_MELOSYS_URL}soknad`;
  /*
  const soknadHeader = new Headers({
    Accept: 'application/json',
    'Accept-Charset': 'utf-8',
    'Content-Type': 'application/json;charset=UTF-8',
  });
  //return postAsJson(URI_SOKNAD, dokument, { headers: soknadHeader });
  */
  return postAsJson(URI_SOKNAD, dokument, { headers: headers });
}

export function hentFagsaker(snr) {
  const URI_FAGSAKER =  `${API_MELOSYS_URL}fagsaker/${snr}`;
  return fetchToJson(URI_FAGSAKER, { headers: headers });
}

export function hentNyesaker(fnr) {
  const URI_NYESAKER = `${API_MELOSYS_URL}sok/fagsaker/?fnr=${fnr}`;
  return fetchToJson(URI_NYESAKER, { headers: headers });
}

export function opprettSak(fnr) {
  const URI_OPPRETTSAK = `${API_MELOSYS_URL}opprettsak/${fnr}`;
  return fetchToJson(URI_OPPRETTSAK, { headers: headers, method: 'POST' });
}

export function hentSakerbehandles(brukernavn) {
  const URI_SAKERBEHANDLES = `${API_MELOSYS_URL}sakerbehandles/${brukernavn}`;
  return fetchToJson(URI_SAKERBEHANDLES, { headers: headers });
}

export function hentTidligeresaker(brukernavn) {
  const URI_TIDLIGERESAKER = `${API_MELOSYS_URL}tidligeresaker/${brukernavn}`;
  return fetchToJson(URI_TIDLIGERESAKER, { headers: headers });
}

export function hentSaksbehandler() {
  const URI_SAKSBEHANDLER = `${API_MELOSYS_URL}${API_SAKSBEHANDLER}`;
  return fetchToJson(URI_SAKSBEHANDLER, { headers: headers });
}

export function hentSaksopplysninger(fnr) {
  const URI_SAMMENSATT_ARBEIDSFORHOLD = `${API_MELOSYS_URL}${API_SAKSOPPLYSNINGER}/${fnr}`;
  return fetchToJson(URI_SAMMENSATT_ARBEIDSFORHOLD, { headers: headers });
}

export function nyHenvendelse(henvendelse) {
  const URI_HENVENDELSE =`${API_MELOSYS_URL}henvendelse`;
  return postAsJson(URI_HENVENDELSE, henvendelse);
}
