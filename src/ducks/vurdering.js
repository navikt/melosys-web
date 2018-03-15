import { createSelector } from 'reselect';
import * as Api from '../services/api';
import { STATUS, doThenDispatch } from '../services/utils';

// Actions
const OK = 'vurdering/OK';
const FEILET = 'vurdering/FEILET';
const PENDING = 'vurdering/PENDING';

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
export function hentVurdering(behandlingID) {
  return doThenDispatch(() => Api.hentVurdering(behandlingID), {
    OK,
    FEILET,
    PENDING,
  });
}

// selector(s)
export const VurderingStatusSelector = createSelector(
  state => (state.vurdering.status ? state.vurdering.status : ''),
  vurderingStatus => vurderingStatus || ''
);

// selector(s)
export const VurderingSelector = createSelector(
  state => (state.vurdering.data.vurdering ? state.vurdering.data.vurdering : {}),
  vurdering => vurdering
);

export const VurderingLovvalgbestemmelserSelector = createSelector(
  state => (state.vurdering.data.vurdering ? state.vurdering.data.vurdering.lovvalgsbestemmelser : []),
  lovvalgsbestemmelser => lovvalgsbestemmelser
);

export const VurderingFeilmeldingSelector = createSelector(
  state => (state.vurdering.data.vurdering ? state.vurdering.data.vurdering.feilmeldinger : []),
  feilmeldinger => feilmeldinger
);
