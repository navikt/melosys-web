import { createSelector } from 'reselect';
import * as Api from './api';
import { STATUS, doThenDispatch } from './utils';

// Actions
export const OK = 'saksbehandler/OK';
export const FEILET = 'saksbehandler/FEILET';
export const PENDING = 'saksbehandler/PENDING';

const initalState = {
  status: STATUS.NOT_STARTED,
  data: {},
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
export function hentSaksbehandler() {
  return doThenDispatch(() => Api.hentSaksbehandler(), {
    OK,
    FEILET,
    PENDING,
  });
}
// selector
const getSaksbehandler = state => state.saksbehandler.data;

// reselect function
export const getSaksbehandlerState = createSelector(
  [getSaksbehandler],
  saksbehandler => saksbehandler
);
