import { combineReducers } from 'redux';
//import { reducer as formReducer } from 'react-redux-form-validation';

//import saksbehandlerReducer from './ducks/saksbehandler';
import saksopplysningerReducer from './ducks/saksopplysninger';
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
  //saksbehandler: saksbehandlerReducer,
  saksopplysninger: saksopplysningerReducer
});