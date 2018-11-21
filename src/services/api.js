import * as Saksflyt from './modules/saksflyt';
import * as Dokumenter from './modules/dokumenter';
import * as Fagsaker from './modules/fagsaker';
import * as Avklartefakta from './modules/avklartefakta';
import * as Health from './modules/health';
import * as Inngang from './modules/inngang';
import * as Journalforing from './modules/journalforing';
import * as Kodeverk from './modules/kodeverk';
import * as Lovvalgsperioder from './modules/lovvalgsperioder';
import * as Personer from './modules/personer';
import * as Organisasjoner from './modules/organisasjoner';
import * as Oppgaver from './modules/oppgaver';
import * as Saksbehandler from './modules/saksbehandler';
import * as Soknader from './modules/soknader';
import * as Vilkar from './modules/vilkar';
import * as Vedtak from './modules/vedtak';

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
  Saksflyt,
  Dokumenter,
  Fagsaker,
  Avklartefakta,
  Health,
  Inngang,
  Journalforing,
  Kodeverk,
  Lovvalgsperioder,
  Oppgaver,
  Organisasjoner,
  Personer,
  Saksbehandler,
  Soknader,
  Vilkar,
  Vedtak,
};
