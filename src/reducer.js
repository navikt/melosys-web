import { combineReducers } from 'redux';
import { reducer as formReducer } from 'react-redux-form-validation';

import fagsakerReducer from './ducks/fagsaker/';
import soknadReducer from './ducks/soknad/';
import faktaavklaringReducer from './ducks/faktaavklaring/';
import vurderingReducer from './ducks/vurdering/';
import sokbehandlingsoppgaveReducer from './ducks/sokbehandlingsoppgave';
import saksbehandlerReducer from './ducks/saksbehandler/';
import kodeverkReducer from './ducks/kodeverk';
import oppgaverReducer from './ducks/oppgaver';
import journalforingReducer from './ducks/journalforing';
import organisasjonReducer from './ducks/organisasjon';
import personReducer from './ducks/person';

export default combineReducers({
  form: formReducer,
  fagsaker: fagsakerReducer,
  soknad: soknadReducer,
  faktaavklaring: faktaavklaringReducer,
  vurdering: vurderingReducer,
  sokbehandlingsoppgave: sokbehandlingsoppgaveReducer,
  saksbehandler: saksbehandlerReducer,
  kodeverk: kodeverkReducer,
  oppgaver: oppgaverReducer,
  journalforing: journalforingReducer,
  organisasjon: organisasjonReducer,
  person: personReducer,
});
