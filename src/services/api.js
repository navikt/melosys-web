import * as Avklartefakta from './modules/avklartefakta';
import * as Behandlinger from './modules/behandlinger/behandlinger';
import * as Behandlingsperioder from './modules/behandlinger/behandlingsperioder';
import * as Behandlingsresultat from './modules/behandlinger/behandlingsresultat';
import * as Dokumenter from './modules/dokumenter';
import * as Fagsaker from './modules/fagsaker/';
import * as Inngang from './modules/inngang';
import * as Journalforing from './modules/journalforing';
import * as Lovvalgsperioder from './modules/lovvalgsperioder';
import * as Personer from './modules/personer';
import * as Organisasjoner from './modules/organisasjoner';
import * as Saksopplysninger from './modules/saksopplysninger';
import * as Oppgaver from './modules/oppgaver';
import * as OpprinneligLovvalgsperiode from './modules/opprinneligLovvalgsperiode';
import * as Registrering from './modules/registrering';
import * as Saksbehandler from './modules/saksbehandler';
import * as Soknader from './modules/soknader';
import * as Vedtak from './modules/vedtak';
import * as Vilkar from './modules/vilkar';

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
// console.log('process.env', process.env);


export {
  Avklartefakta,
  Behandlinger,
  Behandlingsperioder,
  Behandlingsresultat,
  Dokumenter,
  Fagsaker,
  Inngang,
  Journalforing,
  Lovvalgsperioder,
  Oppgaver,
  OpprinneligLovvalgsperiode,
  Organisasjoner,
  Personer,
  Registrering,
  Saksbehandler,
  Saksopplysninger,
  Soknader,
  Vedtak,
  Vilkar,
};
