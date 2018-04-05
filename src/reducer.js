import { combineReducers } from 'redux';
import { reducer as formReducer } from 'react-redux-form-validation';

import fagsakerReducer from './ducks/fagsaker/';
import soknadReducer from './ducks/soknad/';
import faktaavklaringReducer from './ducks/faktaavklaring/';
import vurderingReducer from './ducks/vurdering/';
import nyesakerReducer from './ducks/nyesaker';
import sakerbehandlesReducer from './ducks/sakerbehandles';
import tidligeresakerReducer from './ducks/tidligeresaker';
import saksbehandlerReducer from './ducks/saksbehandler/';
import kodeverkReducer from './ducks/kodeverk';

export default combineReducers({
  form: formReducer,
  fagsaker: fagsakerReducer,
  soknad: soknadReducer,
  faktaavklaring: faktaavklaringReducer,
  vurdering: vurderingReducer,
  nyesaker: nyesakerReducer,
  tidligeresaker: tidligeresakerReducer,
  sakerbehandles: sakerbehandlesReducer,
  saksbehandler: saksbehandlerReducer,
  kodeverk: kodeverkReducer,
});
