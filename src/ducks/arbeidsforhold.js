import * as Api from './api';
import { STATUS, doThenDispatch } from './utils';

// Actions
const OK = 'arbeidsforhold/OK';
const FEILET = 'arbeidsforhold/FEILET';
const PENDING = 'arbeidsforhold/PENDING';

const initialState = {
  data: [],
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
      return { ...state, status: STATUS.OK, data: action.data.arbeidsforhold };
    default:
      return state;
  }
}

// Action Creators
export function hentArbeidsforhold(fnr) {
  return doThenDispatch(() => Api.hentArbeidsforhold(fnr), {
    OK,
    FEILET,
    PENDING
  });
}