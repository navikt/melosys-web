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
import organisasjonerReducer from './ducks/organisasjoner';
import personerReducer from './ducks/personer';
import soknadReducer from './ducks/soknad/';
import vilkarReducer from './ducks/vilkar/';
import saksflytReducer from './ducks/saksflyt';
import sokReducer from './ducks/sok';

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
  organisasjoner: organisasjonerReducer,
  personer: personerReducer,
  vilkar: vilkarReducer,
  saksflyt: saksflytReducer,
  sok: sokReducer,
});
