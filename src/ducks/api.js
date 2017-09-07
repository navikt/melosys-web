//import {CONTEXT_PATH, API_BASE_URL} from '../constants';
//import { fetchToJson, postAsJson, putAsJson } from './../ducks/utils';
import { fetchToJson } from './../ducks/utils';

function erDev() {
  const url = window.location.href;
  return url.includes('debug=true') ||  url.includes('localhost:');
}
//const MOCK_API_SERVER = 'http://localhost:3002';
//const API_MELOSYS_URL = erDev() ? `${MOCK_API_SERVER}${API_BASE_URL}` : '/api';
const API_MELOSYS_URL = erDev() ? 'http://localhost:3002/api/' : '/api';
export function hentSaksbehandler() {
  debugger;
  const URI_SAKSBEHANDLER = `${API_MELOSYS_URL}saksbehandler`;
  return fetchToJson(URI_SAKSBEHANDLER);
}
export function hentPerson(fnr) {
  const URI_PERSON = `${API_MELOSYS_URL}v3/person/${fnr}`;
  return fetchToJson(URI_PERSON);
}
export function hentOrganisasjon(orgnr) {
  const URI_ORGANISASJON = `${API_MELOSYS_URL}organisasjon/${orgnr}`;
  return fetchToJson(URI_ORGANISASJON);
}

export function hentArbeidsforhold(fnr) {
  const URI_ARBEIDSFORHOLD = `${API_MELOSYS_URL}arbeidsforhold/${fnr}`;
  return fetchToJson(URI_ARBEIDSFORHOLD);
}

export function hentArbeidsforholdDetalj(fnr, orgnr) {
  const URI_ARBEIDSFORHOLD_DETALJ = `${API_MELOSYS_URL}arbeidsforhold/${fnr}/${orgnr}`;
  return fetchToJson(URI_ARBEIDSFORHOLD_DETALJ);
}