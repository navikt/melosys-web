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

const genererAvklaringsObjekt = (avklartFakta, avklaringType) => (
  avklartFakta ? {
    ...avklartfaktaMal,
    referanse: avklaringType,
    fakta: [avklartFakta],
  } : null
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
    case Types.RESET:
      return { ...initialState };
    case Types.OPPDATER_AVKLARTEFAKTA: {
      const { dokument } = action;
      const avklartefakta = [
        ...dokument.avklartefakta.oppholdsland,
        ...dokument.avklartefakta.arbeidsgivere,
        genererAvklaringsObjekt(dokument.avklartefakta.sysselsetting, 'SYSSELSETTING'),
        genererAvklaringsObjekt(dokument.avklartefakta.yrkesaktivitetAntallLand, 'YRKESAKTIVITET_ANTALL_LAND'),
        genererAvklaringsObjekt(dokument.avklartefakta.yrkesaktivitet, 'YRKESAKTIVITET'),
      ].filter(fakta => fakta !== null);

      return { ...state, data: [...avklartefakta] };
    }
    default:
      return state;
  }
}
