import { createSelector } from 'reselect';
import * as Api from '../services/api';
import { STATUS, doThenDispatch } from '../services/utils';

// Actions
export const OK = 'sakerbehandles/OK';
export const FEILET = 'sakerbehandles/FEILET';
export const PENDING = 'sakerbehandles/PENDING';

const initalState = {
  status: STATUS.NOT_STARTED,
  data: [],
};
// Reducer
export default function reducer(state = initalState, action) {
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
export function hentSakerbehandles(brukernavn) {
  return doThenDispatch(() => Api.hentSakerbehandles(brukernavn), {
    OK,
    FEILET,
    PENDING,
  });
}

// selector
export const SakerbehandlesSelector = createSelector(
  state => state.sakerbehandles.data,
  sakerbehandles => sakerbehandles
);
