import { combineReducers } from 'redux';
import { reducer as formReducer } from 'redux-form';

import avklartefaktaReducer from './ducks/avklartefakta/';
import behandlingerReducer from './ducks/behandlinger';
import behandlingsperioderReducer from './ducks/behandlingsperioder';
import behandlingsresultatReducer from './ducks/behandlingsresultat';
import dokumenterReducer from './ducks/dokumenter/';
import fagsakerReducer from './ducks/fagsaker/';
import inngangReducer from './ducks/inngang';
import journalforingReducer from './ducks/journalforing';
import lovvalgsperioderReducer from './ducks/lovvalgsperioder';
import oppgaverReducer from './ducks/oppgaver';
import organisasjonerReducer from './ducks/organisasjoner';
import personerReducer from './ducks/personer';
import saksbehandlerReducer from './ducks/saksbehandler/';
import saksopplysningerReducer from './ducks/saksopplysninger';
import sedReducer from './ducks/sed';
import sokReducer from './ducks/sok';
import soknadReducer from './ducks/soknad/';
import vilkarReducer from './ducks/vilkar/';

import customFormReducer from './ducks/form';

export default combineReducers({
  form: formReducer.plugin({ forretningsValidering: customFormReducer }),
  avklartefakta: avklartefaktaReducer,
  behandlinger: behandlingerReducer,
  behandlingsperioder: behandlingsperioderReducer,
  behandlingsresultat: behandlingsresultatReducer,
  dokumenter: dokumenterReducer,
  fagsaker: fagsakerReducer,
  inngang: inngangReducer,
  journalforing: journalforingReducer,
  lovvalgsperioder: lovvalgsperioderReducer,
  oppgaver: oppgaverReducer,
  organisasjoner: organisasjonerReducer,
  personer: personerReducer,
  saksbehandler: saksbehandlerReducer,
  saksopplysninger: saksopplysningerReducer,
  sed: sedReducer,
  sok: sokReducer,
  soknad: soknadReducer,
  vilkar: vilkarReducer,
});
