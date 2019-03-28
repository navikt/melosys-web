import { STATUS } from '../../services/utils';

import * as Types from './types';
import { oppdaterOK, oppdaterPeriode, oppdaterSoknad } from './transforms';

/**
 * Reducers
 * ----------------------------------------------------------------------------------
 * Dette er Redux-reducere som håndterer state-manipulasjon direkte, basert på
 * action types som sendes inn sammen med dataene.
 */

const initialState = {
  data: {},
  status: STATUS.NOT_STARTED,
};

// Reducer
export default function reducer(state = initialState, action) {
  switch (action.type) {
    case Types.PENDING:
      return { ...state, status: STATUS.PENDING };
    case Types.FEILET:
      return { ...state, status: STATUS.ERROR, data: action.data };
    case Types.OK: {
      return oppdaterOK(state, action);
    }
    case Types.RESET:
      return { ...initialState };

    case Types.OPPDATER_PERIODE: {
      return oppdaterPeriode(state, action);
    }
    case Types.OPPDATER_SOKNAD: {
      return oppdaterSoknad(state, action);
    }
    default:
      return state;
  }
}
