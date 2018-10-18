/**
 * Reducers
 * ----------------------------------------------------------------------------------
 * Dette er Redux-reducere som håndterer state-manipulasjon direkte, basert på
 * action types som sendes inn sammen med dataene.
 */

import { STATUS } from '../../services/utils';
import * as Types from './types';

const initialState = {
  data: [],
  status: STATUS.NOT_STARTED,
};

const avklartfaktaMal = {
  referanse: null,
  avklartefaktaKode: null,
  fakta: [],
  subjektID: null,
  begrunnelseKoder: [],
  begrunnelseFritekst: null,
};

const avklartSysselsetting = sysselsettingType => (
  {
    ...avklartfaktaMal,
    referanse: 'SYSSELSETTING',
    fakta: [sysselsettingType],
  }
);

// Reducer
export default function reducer(state = initialState, action) {
  switch (action.type) {
    case Types.PENDING:
      return { ...state, status: STATUS.PENDING };
    case Types.FEILET:
      return { ...state, status: STATUS.ERROR, data: action.data };
    case Types.OK:
      return {
        ...state,
        status: STATUS.OK,
        data: action.data,
      };
    case Types.OPPDATER_AVKLARTEFAKTA: {
      const { dokument } = action;
      const avklartefakta = [
        ...dokument.avklartefakta.oppholdsland,
        avklartSysselsetting(dokument.avklartefakta.sysselsetting),
      ];

      return { ...state, data: [...avklartefakta] };
    }
    default:
      return state;
  }
}
