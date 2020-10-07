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
  // Med data: [] får data type never[] når fila konsumeres i ts. Dette gjør den vanskelig å jobbe med.
  // TODO: Fjern denne disable-linjen når dette skrives om til .ts, og sørg for at data har en type.
  /* eslint-disable no-array-constructor */
  data: Array(),
};

const flettOrganisasjoner = (nyeOrganisasjoner, eksisterendeOrganisasjoner) => {
  const normalisertOrganisasjonsArray = Array.isArray(nyeOrganisasjoner) ? [...nyeOrganisasjoner] : [nyeOrganisasjoner];
  const kunNye = normalisertOrganisasjonsArray.filter(organisasjon => !eksisterendeOrganisasjoner.find(eksisterende => eksisterende.orgnr === organisasjon.orgnr));
  return [...eksisterendeOrganisasjoner, ...kunNye];
};

export default function reducer(state = initalState, action) {
  switch (action.type) {
    case Types.PENDING:
      return { ...state, status: STATUS.PENDING };
    case Types.FEILET:
      return { ...state, status: STATUS.ERROR, resError: action.data };
    case Types.OK: {
      const eksisterendeOrganisasjoner = state.data;

      return { ...state, status: STATUS.OK, data: flettOrganisasjoner(action.data, eksisterendeOrganisasjoner) };
    }
    default:
      return state;
  }
}
