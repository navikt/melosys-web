import { combineReducers } from 'redux';
import { reducer as formReducer } from 'redux-form';

import avklartefaktaReducer from './ducks/avklartefakta/';
import dokumenterReducer from './ducks/dokumenter/';
import fagsakerReducer from './ducks/fagsaker/';
import inngangReducer from './ducks/inngang';
import journalforingReducer from './ducks/journalforing';
import kodeverkReducer from './ducks/kodeverk';
import lovvalgsperioderReducer from './ducks/lovvalgsperioder';
import oppgaverReducer from './ducks/oppgaver';
import saksopplysningerReducer from './ducks/saksopplysninger';
import organisasjonerReducer from './ducks/organisasjoner';
import personerReducer from './ducks/personer';
import saksbehandlerReducer from './ducks/saksbehandler/';
import soknadReducer from './ducks/soknad/';
import sokReducer from './ducks/sok';
import vilkarReducer from './ducks/vilkar/';

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
  saksopplysninger: saksopplysningerReducer,
  sok: sokReducer,
});
