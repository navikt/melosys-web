import * as Types from './types';
/**
 * Reducers
 * ----------------------------------------------------------------------------------
 * Dette er Redux-reducere som håndterer state-manipulasjon direkte, basert på
 * action types som sendes inn sammen med dataene.
 */

// Reducer
export default function reducer(state = {}, action) {
  switch (action.type) {
    case Types.OPPDATER_ALLE_SKJEMA_VALIDERINGER: {
      return { ...state, regler: action.data };
    }
    default:
      return state;
  }
}
