import { createSelector } from 'reselect';
import * as Api from '../services/api';
import { STATUS, doThenDispatch } from '../services/utils';

// Actions
const OK = 'soknader/OK';
const FEILET = 'soknader/FEILET';
const PENDING = 'soknader/PENDING';

const initialState = {
  data: {},
  status: STATUS.NOT_STARTED,
};

// Reducer
export default function reducer(state = initialState, action) {
  switch (action.type) {
    case PENDING:
      return { ...state, status: STATUS.PENDING };
    case FEILET:
      return { ...state, status: STATUS.ERROR, data: action.data };
    case OK:
      return {
        ...state,
        status: STATUS.OK,
        data: action.data,
      };
    default:
      return state;
  }
}

// Action Creators
export function hentSoknader(snr) {
  return doThenDispatch(() => Api.hentSoknader(snr), {
    OK,
    FEILET,
    PENDING,
  });
}

// selector(s)
export const SoknadenSelector = createSelector(
  state => state.soknader.data,
  soknad => soknad,
);
