import { createSelector } from 'reselect';
import * as Api from '../services/api';
import { STATUS, doThenDispatch } from '../services/utils';

// Actions



// Action Creators
export function hentSaksbehandler() {
  return doThenDispatch(() => Api.hentSaksbehandler(), {
    OK,
    FEILET,
    PENDING,
  });
}

// selector
export const SaksbehandlerSelector = createSelector(
  state => state.saksbehandler.data,
  saksbehandler => saksbehandler
);

export const SaksbehandlerStatusSelector = createSelector(
  state => state.saksbehandler.status,
  saksbehandler => saksbehandler
);
