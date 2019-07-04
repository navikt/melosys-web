/**
 * Reducers
 * ----------------------------------------------------------------------------------
 * Dette er Redux-reducere som håndterer state-manipulasjon direkte, basert på
 * action types som sendes inn sammen med dataene.
 */

import { STATUS } from '../../services/utils';
import * as Types from './types';
import * as SoknadTypes from '../soknad/types';

const initalState = {
  status: STATUS.NOT_STARTED,
  data: [],
};

const flettOrganisasjoner = (nyeOrganisasjoner, eksisterendeOrganisasjoner) => {
  const normalisertOrganisasjonsArray = Array.isArray(nyeOrganisasjoner) ? [...nyeOrganisasjoner] : [nyeOrganisasjoner];
  const kunNye = normalisertOrganisasjonsArray.filter(organisasjon => !eksisterendeOrganisasjoner.find(eksisterende => eksisterende.orgnr === organisasjon.orgnr));
  return [...eksisterendeOrganisasjoner, ...kunNye];
};

export default function reducer(state = initalState, action) {
  switch (action.type) {
    case SoknadTypes.OK: {
      if (!action.data.tilleggsData) { return state; }
      const { organisasjoner } = action.data.tilleggsData;
      return { ...state, status: STATUS.OK, data: flettOrganisasjoner(organisasjoner, state.data) };
    }
    case Types.PENDING:
      return { ...state, status: STATUS.PENDING };
    case Types.FEILET:
      return { ...state, status: STATUS.ERROR, data: action.data };
    case Types.OK: {
      return { ...state, status: STATUS.OK, data: flettOrganisasjoner(action.data, state.data) };
    }
    default:
      return state;
  }
}
