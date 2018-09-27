/**
 * Reducers
 * ----------------------------------------------------------------------------------
 * Dette er Redux-reducere som håndterer state-manipulasjon direkte, basert på
 * action types som sendes inn sammen med dataene.
 */

import { STATUS } from '../../services/utils';
import * as Types from './types';

const initalState = {
  status: STATUS.NOT_STARTED,
  data: [],
};

export default function reducer(state = initalState, action) {
  switch (action.type) {
    case Types.PENDING:
      return { ...state, status: STATUS.PENDING };
    case Types.FEILET:
      return { ...state, status: STATUS.ERROR, data: action.data };
    case Types.OK: {
      const eksiterendeOrganisasjoner = [...state.data];
      const normalisertOrganisasjonsArray = Array.isArray(action.data) ? [...action.data] : [action.data];
      const nyeOrganisasjoner = normalisertOrganisasjonsArray.filter(organisasjon => !eksiterendeOrganisasjoner.find(eksisterende => eksisterende.orgnr === organisasjon.orgnr));
      return { ...state, status: STATUS.OK, data: [...eksiterendeOrganisasjoner, ...nyeOrganisasjoner] };
    }
    default:
      return state;
  }
}
