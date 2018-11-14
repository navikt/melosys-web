/**
 * Reducers
 * ----------------------------------------------------------------------------------
 * Dette er Redux-reducere som håndterer state-manipulasjon direkte, basert på
 * action types som sendes inn sammen med dataene.
 */

import { STATUS } from '../../services/utils';
import * as Types from './types';
import * as SoknadTypes from '../soknad/types';

const initalState = {
  status: STATUS.NOT_STARTED,
  data: [],
};

const flettPersoner = (nyePersoner, eksisterendePersoner) => {
  const normalisertPersonArray = Array.isArray(nyePersoner) ? [...nyePersoner] : [nyePersoner];
  const kunNye = normalisertPersonArray.filter(person => !eksisterendePersoner.find(eksisterende => eksisterende.fnr === person.fnr));
  return [...eksisterendePersoner, ...kunNye];
};

export default function reducer(state = initalState, action) {
  switch (action.type) {
    case SoknadTypes.OK: {
      if (!action.data.tilleggsData) { return state; }
      const { personer } = action.data.tilleggsData;
      return { ...state, status: STATUS.OK, data: flettPersoner(personer, state.data) };
    }
    case Types.PENDING:
      return { ...state, status: STATUS.PENDING };
    case Types.FEILET:
      return { ...state, status: STATUS.ERROR, data: action.data };
    case Types.OK: {
      return { ...state, status: STATUS.OK, data: flettPersoner(action.data, state.data) };
    }
    default:
      return state;
  }
}
