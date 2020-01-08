import { combineReducers } from 'redux';
import { reducer as formReducer } from 'redux-form';
import { connectRouter } from 'connected-react-router';

import anmodningsperioderReducer from './ducks/anmodningsperioder/';
import anmodningsperiodesvarReducer from './ducks/anmodningsperiodesvar';
import avklartefaktaReducer from './ducks/avklartefakta/';
import behandlingerReducer from './ducks/behandlinger';
import behandlingsperioderReducer from './ducks/behandlingsperioder';
import behandlingsresultatReducer from './ducks/behandlingsresultat';
import dokumenterReducer from './ducks/dokumenter/';
import fagsakerReducer from './ducks/fagsaker/';
import journalforingReducer from './ducks/journalforing';
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

const createRootReducer = history => combineReducers({
  form: formReducer.plugin({ forretningsValidering: customFormReducer }),
  router: connectRouter(history),
  anmodningsperioder: anmodningsperioderReducer,
  anmodningsperiodesvar: anmodningsperiodesvarReducer,
  avklartefakta: avklartefaktaReducer,
  behandlinger: behandlingerReducer,
  behandlingsperioder: behandlingsperioderReducer,
  behandlingsresultat: behandlingsresultatReducer,
  dokumenter: dokumenterReducer,
  fagsaker: fagsakerReducer,
  journalforing: journalforingReducer,
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

export default createRootReducer;
