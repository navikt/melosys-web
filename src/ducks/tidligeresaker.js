import { createSelector } from 'reselect';
import * as Api from '../services/api';
import { STATUS, doThenDispatch } from '../services/utils';

// Actions
export const OK = 'tidligeresaker/OK';
export const FEILET = 'tidligeresaker/FEILET';
export const PENDING = 'tidligeresaker/PENDING';

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
export function hentTidligeresaker(brukernavn) {
  return doThenDispatch(() => Api.hentTidligeresaker(brukernavn), {
    OK,
    FEILET,
    PENDING,
  });
}

// selector
export const TidligeresakerSelector = createSelector(
  state => state.tidligeresaker.data,
  tidligeresaker => tidligeresaker
);
