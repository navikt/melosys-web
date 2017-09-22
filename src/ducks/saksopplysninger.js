import * as Api from './api';
import { STATUS, doThenDispatch } from './utils';

import { createSelector } from 'reselect';
import moment from 'moment';

// Actions
const OK = 'saksopplysninger/OK';
const FEILET = 'saksopplysninger/FEILET';
const PENDING = 'saksopplysninger/PENDING';

const initialState = {
  data: {},
  status: STATUS.NOT_STARTED
};

// Reducer
export default function reducer(state = initialState, action) {
  switch (action.type) {
    case PENDING:
      return { ...state, status: STATUS.PENDING };
    case FEILET:
      return { ...state, status: STATUS.ERROR, data: action.data };
    case OK:
      return { ...state, status: STATUS.OK, data: sorterSaksopplysninger(action.data) };
    default:
      return state;
  }
}

// Action Creators
export function hentSaksopplysninger(fnr) {
  return doThenDispatch(() => Api.hentSaksopplysninger(fnr), {
    OK,
    FEILET,
    PENDING
  });
}
// selector(s)
export const PersonSelector = createSelector(
  (state) => state.saksopplysninger.data.person,
  (person) => person
);

export const OrganisasjonerSelector = createSelector(
  (state) => state.saksopplysninger.data.organisasjoner,
  (organisasjoner) => organisasjoner
);

export const ArbeidsforholdSelector = createSelector(
  (state) => state.saksopplysninger.data.arbeidsforhold,
  (arbeidsforhold) => arbeidsforhold
);

export const ArbeidsforholdetSelector = createSelector(
  (state, arbeidsforholdID) => arbeidsforholdID,
  (state) => state.saksopplysninger.data.arbeidsforhold || [],
  (arbeidsforholdID, arbeidsforhold) => arbeidsforhold.find((item) => item.arbeidsforholdIDnav.toString() === arbeidsforholdID)
);

export const OrganisasjonSelector = createSelector(
  (state, orgnummer) => orgnummer,
  (state) => state.saksopplysninger.data.organisasjoner || [],
  (orgnummer, organisasjoner) => organisasjoner.find((item) => item.orgnummer === orgnummer)
);

export const OrganisasjonSelectorByNavID = createSelector(
  [ArbeidsforholdetSelector, OrganisasjonerSelector],
  (arbeidsforholdet, organisasjoner) => organisasjoner ? organisasjoner.find((item) => item.orgnummer === arbeidsforholdet.arbeidsgiver.orgnummer): {}
);

// Private utility methods
function sorterSaksopplysninger(saksopplysninger) {
  sorterArbeidsForholdPaaAnsettelsePeriode(saksopplysninger);
  sorterOrganisasjoner(saksopplysninger);
  return saksopplysninger;
}

function sorterArbeidsForholdPaaAnsettelsePeriode(saksopplysninger) {
  saksopplysninger.arbeidsforhold.sort(function (a, b) {
    if (a.ansettelsesPeriode.fom && b.ansettelsesPeriode.fom)
      return sortByDateDescending(a.ansettelsesPeriode.fom, b.ansettelsesPeriode.fom);
    else
      return -1;
  });
}

function sorterOrganisasjoner(saksopplysninger) {
  saksopplysninger.organisasjoner.sort((a, b) => {
    if (a.orgnummer > b.orgnummer) {
      return 1;
    }
    else if (a.orgnummer === b.orgnummer) {
      return 0;
    }
    return -1;
  });
}

const sortByDateDescending = (adate, bdate) => {
  let amom = moment(adate);
  let bmom = moment(bdate);
  if (amom.isAfter(bmom)) {
    return -1;
  }
  else if (amom.isSame(bmom)) {
    return 0;
  }
  else {
    return 1;
  }
};