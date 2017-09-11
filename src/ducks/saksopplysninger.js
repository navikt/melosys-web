import * as Api from './api';
import { STATUS, doThenDispatch } from './utils';

// Actions
const OK = 'saksopplysninger/OK';
const FEILET = 'saksopplysninger/FEILET';
const PENDING = 'saksopplysninger/PENDING';

const initialState = {
  data: {},
  status: STATUS.NOT_STARTED
};

// Reducer
export default function reducer(state = initialState, action) {
  switch (action.type) {
    case PENDING:
      return { ...state, status: STATUS.PENDING };
    case FEILET:
      return { ...state, status: STATUS.ERROR, data: action.data };
    case OK:
      return { ...state, status: STATUS.OK, data: action.data };
    default:
      return state;
  }
}

// Action Creators
export function hentSaksopplysninger(fnr) {
  return doThenDispatch(() => Api.hentSaksopplysninger(fnr), {
    OK,
    FEILET,
    PENDING
  });
}