import { combineReducers } from 'redux';
import { reducer as formReducer } from 'react-redux-form-validation';

import fagsakerReducer from './ducks/fagsaker/';
import faktaavklaringReducer from './ducks/faktaavklaring/';
import inngangReducer from './ducks/inngang';
import journalforingReducer from './ducks/journalforing';
import kodeverkReducer from './ducks/kodeverk';
import saksbehandlerReducer from './ducks/saksbehandler/';
import oppgaverReducer from './ducks/oppgaver';
import organisasjonReducer from './ducks/organisasjon';
import personReducer from './ducks/person';
import soknadReducer from './ducks/soknad/';
import vurderingReducer from './ducks/vurdering/';

export default combineReducers({
  form: formReducer,
  fagsaker: fagsakerReducer,
  faktaavklaring: faktaavklaringReducer,
  inngang: inngangReducer,
  journalforing: journalforingReducer,
  kodeverk: kodeverkReducer,
  saksbehandler: saksbehandlerReducer,
  soknad: soknadReducer,
  oppgaver: oppgaverReducer,
  organisasjon: organisasjonReducer,
  person: personReducer,
  vurdering: vurderingReducer,
});
