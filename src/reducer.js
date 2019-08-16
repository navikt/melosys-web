import { combineReducers } from 'redux';
import { reducer as formReducer } from 'redux-form';

import anmodningsperioderReducer from './ducks/anmodningsperioder/';
import anmodningsperiodesvarReducer from './ducks/anmodningsperiodesvar';
import avklartefaktaReducer from './ducks/avklartefakta/';
import behandlingerReducer from './ducks/behandlinger';
import behandlingsperioderReducer from './ducks/behandlingsperioder';
import behandlingsresultatReducer from './ducks/behandlingsresultat';
import dokumenterReducer from './ducks/dokumenter/';
import fagsakerReducer from './ducks/fagsaker/';
import inngangReducer from './ducks/inngang';
import journalforingReducer from './ducks/journalforing';
import eessikodeverkReducer from './ducks/eessikodeverk';
import lovvalgsperioderReducer from './ducks/lovvalgsperioder';
import oppgaverReducer from './ducks/oppgaver';
import organisasjonerReducer from './ducks/organisasjoner';
import personerReducer from './ducks/personer';
import saksbehandlerReducer from './ducks/saksbehandler/';
import saksopplysningerReducer from './ducks/saksopplysninger';
import sokReducer from './ducks/sok';
import soknadReducer from './ducks/soknad/';
import vilkarReducer from './ducks/vilkar/';
import vedtakReducer from './ducks/vedtak';

import customFormReducer from './ducks/form';

export default combineReducers({
  form: formReducer.plugin({ forretningsValidering: customFormReducer }),
  anmodningsperioder: anmodningsperioderReducer,
  anmodningsperiodesvar: anmodningsperiodesvarReducer,
  avklartefakta: avklartefaktaReducer,
  behandlinger: behandlingerReducer,
  behandlingsperioder: behandlingsperioderReducer,
  behandlingsresultat: behandlingsresultatReducer,
  dokumenter: dokumenterReducer,
  fagsaker: fagsakerReducer,
  inngang: inngangReducer,
  journalforing: journalforingReducer,
  eessikodeverk: eessikodeverkReducer,
  lovvalgsperioder: lovvalgsperioderReducer,
  oppgaver: oppgaverReducer,
  organisasjoner: organisasjonerReducer,
  personer: personerReducer,
  saksbehandler: saksbehandlerReducer,
  saksopplysninger: saksopplysningerReducer,
  sok: sokReducer,
  soknad: soknadReducer,
  vedtak: vedtakReducer,
  vilkar: vilkarReducer,
});
