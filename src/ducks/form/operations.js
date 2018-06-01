/**
 * Operations
 * ----------------------------------------------------------------------------------
 * Dette er Thunk-operasjoner som muliggjør asynkrone kall mot Redux
 * ved å returnere en action-generatoren som en egen funksjon. Denne kjøres deretter
 * når det asynkrone kallet, feks fra API'et er ferdigkjørt.
 *
 */

import { change } from 'redux-form';
import * as formActions from './actions';

export const oppdaterAlleSkjemaValideringer = dispatch => validering => {
  dispatch(formActions.oppdaterAlleSkjemaValideringer(validering));
  // Fixme: Dette er en hack for å tvinge redux form (og dermed validate) til å oppdatere. Ikke spes. elegant.
  dispatch(change('soknad', 'foo', 'bar'));
};
