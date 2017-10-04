import * as Api from './api';
import { STATUS, doThenDispatch } from './utils';

// Actions

export const OPPDATER_ARBEIDSGIVER = 'arbeidsgiver/oppdater';
export const OPPDATER_ARBEIDSGIVER_OK = 'arbeidsgiver/oppdater/ok';
export const OPPDATER_ARBEIDSGIVER_FEILET = 'arbeidsgiver/oppdater/fail';

const initalState = {
  status: STATUS.NOT_STARTED,
  data: {},
};

// Reducer
export default function reducer(state = initalState, action) {
  const data = action.data;
  switch (action.type) {
    case OPPDATER_ARBEIDSGIVER_FEILET:
      return { ...state, status: STATUS.ERROR, feil: data };
    case OPPDATER_ARBEIDSGIVER_OK:
      return { ...state, status: STATUS.OK, data: { ...data } };
    default:
      return state;
  }
}

export function nyHenvendelse(henvendelse) {
  return doThenDispatch(() => Api.nyHenvendelse(henvendelse), {
    OK: OPPDATER_ARBEIDSGIVER_OK,
    FEILET: OPPDATER_ARBEIDSGIVER_FEILET,
    PENDING: OPPDATER_ARBEIDSGIVER,
  });
}
