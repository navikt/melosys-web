//import {CONTEXT_PATH, API_BASE_URL} from '../constants';
//import { fetchToJson, postAsJson, putAsJson } from './../ducks/utils';
import { fetchToJson, postAsJson } from './utils';
/*
function erDev() {
  // const url = window.location.href;
  // return url.includes('debug=true') ||  url.includes('localhost:');
  //return false;
  // from .env or .env.local
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


const headers = new Headers({
  'Accept': 'application/json',
  'Accept-Charset': 'utf-8'
});

export function hentSaksbehandler() {
  const URI_SAKSBEHANDLER = `${API_MELOSYS_URL}${API_SAKSBEHANDLER}`;
  return fetchToJson(URI_SAKSBEHANDLER, {headers: headers});
}

export function hentSaksopplysninger(fnr) {
  const URI_SAMMENSATT_ARBEIDSFORHOLD = `${API_MELOSYS_URL}${API_SAKSOPPLYSNINGER}/${fnr}`;
  return fetchToJson(URI_SAMMENSATT_ARBEIDSFORHOLD, {headers: headers});
}

export function nyHenvendelse(henvendelse) {
  //const URI_HENVENDELSE =`${API_MELOSYS_URL}henvendelse`;
  //return postAsJson(URI_HENVENDELSE, henvendelse);
  const URI_HENVENDELSE = 'http://10.33.46.106:3002/api/henvendelse';
  return postAsJson(URI_HENVENDELSE, henvendelse);
}