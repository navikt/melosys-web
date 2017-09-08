import * as Api from './api';
import { STATUS, doThenDispatch } from './utils';

// Actions
const OK = 'organisasjon/OK';
const FEILET = 'organisasjon/FEILET';
const PENDING = 'organisasjon/PENDING';

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
export function hentOrganisasjon(orgnr) {
  return doThenDispatch(() => Api.hentOrganisasjon(orgnr), {
    OK,
    FEILET,
    PENDING
  });
}