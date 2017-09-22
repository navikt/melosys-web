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
const getPerson = (state) => state.saksopplysninger.data.person;
const getAlleOrganisasjoner = (state) => state.saksopplysninger.data.organisasjoner;
const getAlleArbeidsforhold = (state) => state.saksopplysninger.data.arbeidsforhold;
const getArbeidsforholdet = (state, arbeidsforholdID) => {
  if (state.saksopplysninger.status === 'OK') {
    console.assert(/^[0-9]{8}$/.test(arbeidsforholdID), 'Ugyldig arbeidsforholdID:', arbeidsforholdID);
    return state.saksopplysninger.data.arbeidsforhold.find((item) => item.arbeidsforholdIDnav.toString() === arbeidsforholdID);
  }
  return state;
};

const getOrganisasjonByOrgnummer = (state, orgnummer) => {
  if (state.saksopplysninger.status === 'OK') {
    console.assert(/^[0-9]{9}$/.test(orgnummer), 'Ugyldig orgnummer:', orgnummer);
    if (!/^[0-9]{9}$/.test(orgnummer))
      return {};
    const organisasjoner = getAlleOrganisasjonerState(state);
    const organisasjon = organisasjoner.find((item) => item.orgnummer === orgnummer);
    return organisasjon;
  }
  return state;
};

const getOrganisasjonByArbeidsforholdID =  (state, arbeidsforholdID) => {
  if (state.saksopplysninger.status === 'OK') {
    console.assert(/^[0-9]{8}$/.test(arbeidsforholdID), 'Ugyldig arbeidsforholdID:', arbeidsforholdID);
    const getArbeidsforholdetState = makeGetArbeidsforholdetState();
    const arbeidsforholdet = getArbeidsforholdetState(state, arbeidsforholdID);

    if (!arbeidsforholdet) {
      return {};
    }
    const { arbeidsgiver: {orgnummer} } = arbeidsforholdet;
    return getOrganisasjonByOrgnummer(state, orgnummer);
  }
  return state;
};

// reselect functions
export const getPersonState = createSelector(
  [ getPerson ],
  (person) => person
);

export const getAlleOrganisasjonerState = createSelector(
  [ getAlleOrganisasjoner ],
  (organisasjoner) => organisasjoner
);

export const getAlleArbeidsforholdState = createSelector(
  [ getAlleArbeidsforhold ],
  (arbeidsforhold) => arbeidsforhold
);
export const makeGetArbeidsforholdetState = () => createSelector(
  [ getArbeidsforholdet ],
  (arbeidsforholdet) => arbeidsforholdet
);
export const makeGetOrganisasjonStateByArbeidsforholdID = () => createSelector(
  [ getOrganisasjonByArbeidsforholdID ],
  (organisasjon) => organisasjon
);
export const makeGetOrganisasjonStateByOrgnummer = () => createSelector(
  [ getOrganisasjonByOrgnummer ],
  (organisasjon) => organisasjon
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