import { createSelector } from 'reselect';
import * as Api from '../services/api';
import { STATUS, doThenDispatch } from '../services/utils';

// Actions
const OK = 'soknader/OK';
const FEILET = 'soknader/FEILET';
const PENDING = 'soknader/PENDING';

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
export function hentSoknader(snr) {
  return doThenDispatch(() => Api.hentSoknader(snr), {
    OK,
    FEILET,
    PENDING,
  });
}

// selector(s)
export const SoknadenSelector = createSelector(
  state => state.soknader.data.soknadDokument && state.soknader.data,
  soknad => soknad
);

export const SoknadIDSelector = createSelector(
  state => state.soknader.data.soknadDokument && state.soknader.data,
  soknad => soknad.id
);

export const ArbeidNorgeSelector = createSelector(
  state => state.soknader.data.soknadDokument && state.soknader.data.soknadDokument.arbeidNorge,
  soknad => soknad
);

export const ArbeidUtlandSelector = createSelector(
  state => state.soknader.data.soknadDokument && state.soknader.data.soknadDokument.arbeidUtland,
  soknad => soknad
);

export const ArbeidsinntektSelector = createSelector(
  state => state.soknader.data.soknadDokument && state.soknader.data.soknadDokument.arbeidsinntekt,
  soknad => soknad
);

export const ForetakUtlandSelector = createSelector(
  state => state.soknader.data.soknadDokument && state.soknader.data.soknadDokument.foretakUtland,
  soknad => soknad
);

export const JuridiskArbeidsgiverNorgeSelector = createSelector(
  state => state.soknader.data.soknadDokument && state.soknader.data.soknadDokument.juridiskArbeidsgiverNorge,
  soknad => soknad
);

export const OppholdUtlandSelector = createSelector(
  state => state.soknader.data.soknadDokument && state.soknader.data.soknadDokument.oppholdUtland,
  soknad => soknad
);

export const OvrigSelector = createSelector(
  state => state.soknader.data.soknadDokument && state.soknader.data.soknadDokument.ovrig,
  soknad => soknad
);
