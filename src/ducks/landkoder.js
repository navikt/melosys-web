import { createSelector } from 'reselect';
import * as Api from '../services/api';
import { STATUS, doThenDispatch } from '../services/utils';

// Actions
export const OK = 'landkoder/OK';
export const FEILET = 'landkoder/FEILET';
export const PENDING = 'landkoder/PENDING';

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
export function hentLandkoder() {
  return doThenDispatch(() => Api.hentLandkoder(), {
    OK,
    FEILET,
    PENDING,
  });
}

// selector
export const LandkoderSelector = createSelector(
  state => state.landkoder.data,
  landkoder => landkoder
);
