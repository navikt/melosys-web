import { createSelector } from 'reselect';
import * as Api from '../services/api';
import { STATUS, doThenDispatch } from '../services/utils';
import sorterSaksopplysninger from './saksopplysninger-utils';

// Actions
const OK = 'saksopplysninger/OK';
const FEILET = 'saksopplysninger/FEILET';
const PENDING = 'saksopplysninger/PENDING';

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
        data: sorterSaksopplysninger(action.data.behandlinger[0]),
      };
    default:
      return state;
  }
}

// Action Creators
export function hentSaksopplysninger(fnr) {
  return doThenDispatch(() => Api.hentSaksopplysninger(fnr), {
    OK,
    FEILET,
    PENDING,
  });
}
// selector(s)
export const PersonSelector = createSelector(
  state => state.saksopplysninger.data.person,
  person => person
);

export const OrganisasjonerSelector = createSelector(
  state => state.saksopplysninger.data.organisasjoner,
  organisasjoner => organisasjoner
);

export const ArbeidsforholdSelector = createSelector(
  state => state.saksopplysninger.data.arbeidsforhold,
  arbeidsforhold => arbeidsforhold
);

export const ArbeidsgiverSelector = createSelector(
  state => state.saksopplysninger.data.arbeidsforhold,
  arbeidsforhold => arbeidsforhold
);

export const ArbeidsforholdetSelector = createSelector(
  (state, arbeidsforholdID) => arbeidsforholdID,
  state => state.saksopplysninger.data.arbeidsforhold || [],
  (arbeidsforholdID, arbeidsforhold) =>
    arbeidsforhold.find(
      item => item.arbeidsforholdIDnav.toString() === arbeidsforholdID
    )
);

export const OrganisasjonSelector = createSelector(
  (state, orgnummer) => orgnummer,
  state => state.saksopplysninger.data.organisasjoner || [],
  (orgnummer, organisasjoner) =>
    organisasjoner.find(item => item.orgnummer === orgnummer)
);
export const OrganisasjonSelectorByNavID = createSelector(
  [ArbeidsforholdetSelector, OrganisasjonerSelector],
  (arbeidsforholdet, organisasjoner) => (
    organisasjoner
      ? organisasjoner.find(item => item.orgnummer === arbeidsforholdet.arbeidsgiver.orgnummer)
      : {}
  )
);
