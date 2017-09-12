//import {CONTEXT_PATH, API_BASE_URL} from '../constants';
//import { fetchToJson, postAsJson, putAsJson } from './../ducks/utils';
import { fetchToJson } from './../ducks/utils';

function erDev() {
  const url = window.location.href;
  return url.includes('debug=true') ||  url.includes('localhost:');
  //return false;

}
const MOCK_API_SERVER = erDev() ? 'http://localhost:3002' : 'https://e34jbsl01783.devillo.no:8443';
const API_BASE_URL = erDev() ? '/api/' : '/system/melosys/api/';
const API_MELOSYS_URL = `${MOCK_API_SERVER}${API_BASE_URL}`;

//const API_MELOSYS_URL = erDev() ? 'http://localhost:3002/api/' : '/api';
const headers = new Headers({
  'Accept': 'application/json',
  'Accept-Charset': 'utf-8'
});

export function hentSaksbehandler() {
  const URI_SAKSBEHANDLER = `${API_MELOSYS_URL}saksbehandler`;
  return fetchToJson(URI_SAKSBEHANDLER, {headers: headers});
}

export function hentSaksopplysninger(fnr) {
  const saksopplysningerOgArbeidsforhold = erDev() ? 'saksopplysninger/' : 'arbeidsforhold/';
  const URI_SAMMENSATT_ARBEIDSFORHOLD = `${API_MELOSYS_URL}${saksopplysningerOgArbeidsforhold}${fnr}`;
  //const URI_SAMMENSATT_ARBEIDSFORHOLD = `https://e34jbsl01783.devillo.no:8443/system/melosys/api/arbeidsforhold/${fnr}`;
  return fetchToJson(URI_SAMMENSATT_ARBEIDSFORHOLD, {headers: headers});

}