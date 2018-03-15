import { createSelector } from 'reselect';
import * as Api from '../services/api';
import { STATUS, doThenDispatch } from '../services/utils';

// Actions
export const OK = 'nyesaker/OK';
export const FEILET = 'nyesaker/FEILET';
export const PENDING = 'nyesaker/PENDING';
export const OPPRETT = 'nyesaker/OPPRETT';

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
      return {
        ...state, status: STATUS.ERROR, data: action.data, response: action.data.response,
      };
    case OK:
      return { ...state, status: STATUS.OK, data: action.data };
    case OPPRETT: {
      return { ...state, data: [{ ...action.data }, ...state.data] };
    }
    default:
      return state;
  }
}

// Action Creators
export function hentNyesaker(fnr) {
  return doThenDispatch(() => Api.hentNyesaker(fnr), {
    OK,
    FEILET,
    PENDING,
  });
}

export function opprettNyFagsak(fnr) {
  return dispatch => {
    Api.opprettNyFagsak(fnr).then(data => {
      dispatch({
        type: OPPRETT,
        data,
      });
    });
  };
}

// selector
export const NyesakerSelector = createSelector(
  state => state.nyesaker.data,
  nyesaker => nyesaker
);
