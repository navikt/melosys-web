import { createSelector } from 'reselect';
import * as Api from '../services/api';
import { STATUS, doThenDispatch } from '../services/utils';

// Actions
const OK = 'soknad/OK';
const FEILET = 'soknad/FEILET';
const PENDING = 'soknad/PENDING';

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
export function hentSoknad(snr) {
  return doThenDispatch(() => Api.hentSoknad(snr), {
    OK,
    FEILET,
    PENDING,
  });
}

export function lagreSoknad(snr) {
  return doThenDispatch(() => Api.hentSoknad(snr), {
    OK,
    FEILET,
    PENDING,
  });
}

// selector(s)
export const SoknadSelector = createSelector(
  state => state.soknad.data.soknadDokument && state.soknad.data,
  soknad => soknad
);

export const SoknadIDSelector = createSelector(
  state => state.soknad.data.soknadDokument && state.soknad.data,
  soknad => soknad.id
);

export const ArbeidNorgeSelector = createSelector(
  state => state.soknad.data.soknadDokument && state.soknad.data.soknadDokument.arbeidNorge,
  soknad => soknad
);

export const ArbeidUtlandSelector = createSelector(
  state => state.soknad.data.soknadDokument && state.soknad.data.soknadDokument.arbeidUtland,
  soknad => soknad
);

export const ArbeidsinntektSelector = createSelector(
  state => state.soknad.data.soknadDokument && state.soknad.data.soknadDokument.arbeidsinntekt,
  soknad => soknad
);

export const ForetakUtlandSelector = createSelector(
  state => state.soknad.data.soknadDokument && state.soknad.data.soknadDokument.foretakUtland,
  soknad => soknad
);

export const JuridiskArbeidsgiverNorgeSelector = createSelector(
  state => state.soknad.data.soknadDokument && state.soknad.data.soknadDokument.juridiskArbeidsgiverNorge,
  soknad => soknad
);

export const OppholdUtlandSelector = createSelector(
  state => state.soknad.data.soknadDokument && state.soknad.data.soknadDokument.oppholdUtland,
  soknad => soknad
);

export const OvrigSelector = createSelector(
  state => state.soknad.data.soknadDokument && state.soknad.data.soknadDokument.ovrig,
  soknad => soknad
);
