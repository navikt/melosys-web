import { combineReducers } from 'redux';
import { reducer as formReducer } from 'redux-form';

import dokumenterReducer from './ducks/dokumenter/';
import fagsakerReducer from './ducks/fagsaker/';
import avklartefaktaReducer from './ducks/avklartefakta/';
import inngangReducer from './ducks/inngang';
import journalforingReducer from './ducks/journalforing';
import kodeverkReducer from './ducks/kodeverk';
import lovvalgsperioderReducer from './ducks/lovvalgsperioder';
import saksbehandlerReducer from './ducks/saksbehandler/';
import oppgaverReducer from './ducks/oppgaver';
import organisasjonReducer from './ducks/organisasjon';
import personReducer from './ducks/person';
import soknadReducer from './ducks/soknad/';
import vilkarReducer from './ducks/vilkar/';
import saksflytReducer from './ducks/saksflyt';

import customFormReducer from './ducks/form';

export default combineReducers({
  form: formReducer.plugin({ forretningsValidering: customFormReducer }),
  dokumenter: dokumenterReducer,
  fagsaker: fagsakerReducer,
  avklartefakta: avklartefaktaReducer,
  inngang: inngangReducer,
  journalforing: journalforingReducer,
  kodeverk: kodeverkReducer,
  lovvalgsperioder: lovvalgsperioderReducer,
  saksbehandler: saksbehandlerReducer,
  soknad: soknadReducer,
  oppgaver: oppgaverReducer,
  organisasjon: organisasjonReducer,
  person: personReducer,
  vilkar: vilkarReducer,
  saksflyt: saksflytReducer,
});
