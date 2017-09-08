import * as Api from './api';
import { STATUS, doThenDispatch } from './utils';

// Actions
const OK = 'arbeidsforholdDetalj/OK';
const FEILET = 'arbeidsforholdDetalj/FEILET';
const PENDING = 'arbeidsforholdDetalj/PENDING';

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
export function hentArbeidsforholdDetalj(fnr, orgnr) {
  return doThenDispatch(() => Api.hentArbeidsforholdDetalj(fnr, orgnr), {
    OK,
    FEILET,
    PENDING
  });
}