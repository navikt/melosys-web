/**
 * Reducers
 * ----------------------------------------------------------------------------------
 * Dette er Redux-reducere som håndterer state-manipulasjon direkte, basert på
 * action types som sendes inn sammen med dataene.
 */

import { STATUS } from '../../services/utils';
import * as Types from './types';

const initialState = {
  data: [],
  status: STATUS.NOT_STARTED,
};

function oppdaterSteg(array, steg, felt) {
  return array.map(item => {
    if (item.steg !== steg) {
      return item;
    }

    return {
      ...item,
      felt,
    };
  });
}

export default function reducer(state = initialState, action) {
  switch (action.type) {
    case Types.RESET:
      return initialState;
    case Types.NYTT_STEG:
      return [...state, action.steg];
    case Types.OPPDATER_RESSURS:
      return oppdaterSteg(state, action.data.steg, action.data.felt);
    default:
      return state;
  }
}

