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
export function hentSaksopplysninger(snr) {
  return doThenDispatch(() => Api.hentFagsaker(snr), {
    OK,
    FEILET,
    PENDING,
  });
}
// selector(s)
export const PersonSelector = createSelector(
  state => state.fagsaker.data.person,
  person => person
);
export const Inntekt = createSelector(
  state => state.fagsaker.data.inntekt,
  inntekt => inntekt
);
export const Bekreftelser = createSelector(
  state => state.fagsaker.data.bekreftelser,
  bekreftelser => bekreftelser
);
export const Soknaden = createSelector(
  state => state.fagsaker.data.soknaden,
  soknaden => soknaden
);
export const Medlemsskap = createSelector(
  state => state.fagsaker.data.medlemsskap,
  medlemsskap => medlemsskap
);
export const OrganisasjonerSelector = createSelector(
  state => state.fagsaker.data.organisasjoner,
  organisasjoner => organisasjoner
);

export const ArbeidsforholdSelector = createSelector(
  state => state.fagsaker.data.arbeidsforhold,
  arbeidsforhold => arbeidsforhold
);

export const ArbeidsforholdetSelector = createSelector(
  (state, arbeidsforholdID) => arbeidsforholdID,
  state => state.fagsaker.data.arbeidsforhold || [],
  (arbeidsforholdID, arbeidsforhold) =>
    arbeidsforhold.find(
      item => item.arbeidsforholdIDnav.toString() === arbeidsforholdID
    )
);

export const OrganisasjonSelector = createSelector(
  (state, orgnummer) => orgnummer,
  state => state.fagsaker.data.organisasjoner || [],
  (orgnummer, organisasjoner) =>
    organisasjoner.find(item => item.orgnummer === orgnummer)
);
