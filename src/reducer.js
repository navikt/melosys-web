import { combineReducers } from 'redux';
import { reducer as formReducer } from 'react-redux-form-validation';

import fagsakerReducer from './ducks/fagsaker';
import soknadReducer from './ducks/soknad';
import faktaavklaringReducer from './ducks/faktaavklaring';
import nyesakerReducer from './ducks/nyesaker';
import sakerbehandlesReducer from './ducks/sakerbehandles';
import tidligeresakerReducer from './ducks/tidligeresaker';
import saksbehandlerReducer from './ducks/saksbehandler';
import saksopplysningerReducer from './ducks/saksopplysninger';
import arbeidsgiverReducer from './ducks/arbeidsgiver';
/*
export const RESET_STORE = { type: 'store/reset' };

const combinedReducers = combineReducers({
//  form: formReducer,
  data: combineReducers({
    saksbehandler: saksbehandlerReducer
    // person: personReducer,
    // organisasjon: organisasjonReducer,
    // arbeidsforhold: arbeidsforholdReducer,
    // arbeidsforholdDetalj: arbeidsforholdDetaljReducer
  })
});

export default function(state, action) {
  if (action.type === RESET_STORE.type) {
    return combinedReducers(undefined, action);
  }
  return combinedReducers(state, action);
}
*/
export default combineReducers({
  form: formReducer,
  fagsaker: fagsakerReducer,
  soknad: soknadReducer,
  faktaavklaring: faktaavklaringReducer,
  nyesaker: nyesakerReducer,
  tidligeresaker: tidligeresakerReducer,
  sakerbehandles: sakerbehandlesReducer,
  saksopplysninger: saksopplysningerReducer,
  saksbehandler: saksbehandlerReducer,
  arbeidsgiver: arbeidsgiverReducer,
});
