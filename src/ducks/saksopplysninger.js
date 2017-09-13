import * as Api from './api';
import { STATUS, doThenDispatch } from './utils';

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
}