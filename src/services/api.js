/* eslint-disable */
import { getAsJson, postAsJson } from './utils';
import { API_BASE_URL }  from './api-constants';

import * as Dokumenter from './modules/dokumenter';
import * as Fagsaker from './modules/fagsaker';
import * as Faktaavklaring from './modules/faktaavklaring';
import * as Health from './modules/health';
import * as Journalforing from './modules/journalforing';
import * as Kodeverk from './modules/kodeverk';
import * as Personer from './modules/personer';
import * as Organisasjoner from './modules/organisasjoner';
import * as Oppgaver from './modules/oppgaver';
import * as Saksbehandler from './modules/saksbehandler';
import * as Soknader from './modules/soknader';
import * as Vurdering from './modules/vurdering';

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
// const API_BASE_URL = `${process.env.REACT_APP_API_BASE_URL}`;
//console.log('process.env', process.env);

// TODO Er disse to benyttet?
export function hentSakerbehandles(brukernavn) {
  const URI_SAKERBEHANDLES = `${API_BASE_URL}sakerbehandles/${brukernavn}`;
  return getAsJson(URI_SAKERBEHANDLES);
}

export function hentTidligeresaker(brukernavn) {
  const URI_TIDLIGERESAKER = `${API_BASE_URL}tidligeresaker/${brukernavn}`;
  return getAsJson(URI_TIDLIGERESAKER);
}

export {
  Dokumenter,
  Fagsaker,
  Faktaavklaring,
  Health,
  Journalforing,
  Kodeverk,
  Oppgaver,
  Organisasjoner,
  Personer,
  Saksbehandler,
  Soknader,
  Vurdering,
}
