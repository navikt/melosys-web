import { createSelector } from 'reselect';
import * as Api from '../services/api';
import { STATUS, doThenDispatch } from '../services/utils';

// Actions
const OK = 'fagsaker/OK';
const FEILET = 'fagsaker/FEILET';
const PENDING = 'fagsaker/PENDING';

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
export function hentFagsaker(snr) {
  return doThenDispatch(() => Api.hentFagsaker(snr), {
    OK,
    FEILET,
    PENDING,
  });
}
// selector(s)
export const PersonSelector = createSelector(
  state => (state.fagsaker.data.behandlinger ? state.fagsaker.data.behandlinger[0].person : state.fagsaker.data),
  person => person
);
export const InntektSelector = createSelector(
  state => (state.fagsaker.data.behandlinger ? state.fagsaker.data.behandlinger[0].inntekt : state.fagsaker.data),
  inntekt => inntekt
);
export const BekreftelserSelector = createSelector(
  state => (state.fagsaker.data.behandlinger ? state.fagsaker.data.behandlinger[0].bekreftelser : state.fagsaker.data),
  bekreftelser => bekreftelser
);
export const SoknadenSelector = createSelector(
  state => (state.fagsaker.data.behandlinger ? state.fagsaker.data.behandlinger[0].soknaden : state.fagsaker.data),
  soknaden => soknaden
);
export const MedlemsskapSelector = createSelector(
  state => (state.fagsaker.data.behandlinger ? state.fagsaker.data.behandlinger[0].medlemsskap : state.fagsaker.data),
  medlemsskap => medlemsskap
);
export const OrganisasjonerSelector = createSelector(
  state => (state.fagsaker.data.behandlinger ? state.fagsaker.data.behandlinger[0].organisasjoner : state.fagsaker.data),
  organisasjoner => organisasjoner
);

export const ArbeidsforholdSelector = createSelector(
  state => (state.fagsaker.data.behandlinger ? state.fagsaker.data.behandlinger[0].arbeidsforhold : state.fagsaker.data),
  arbeidsforhold => arbeidsforhold
);

export const ArbeidsforholdetSelector = createSelector(
  (state, arbeidsforholdID) => arbeidsforholdID,
  state => state.fagsaker.data.behandlinger[0].arbeidsforhold || [],
  (arbeidsforholdID, arbeidsforhold) =>
    arbeidsforhold.find(
      item => item.arbeidsforholdIDnav.toString() === arbeidsforholdID
    )
);

export const OrganisasjonSelector = createSelector(
  (state, orgnummer) => orgnummer,
  state => (state.fagsaker.data.behandlinger ? state.fagsaker.data.behandlinger[0].organisasjoner : []),
  (orgnummer, organisasjoner) =>
    organisasjoner.find(item => item.orgnummer === orgnummer)
);
