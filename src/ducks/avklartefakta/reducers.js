/**
 * Reducers
 * ----------------------------------------------------------------------------------
 * Dette er Redux-reducere som håndterer state-manipulasjon direkte, basert på
 * action types som sendes inn sammen med dataene.
 */

import { formatterDatoTilISO } from '../../utils/dato';
import { STATUS } from '../../services/utils';
import * as Types from './types';

import { VurderingBostedslandTyper } from '../../felles-komponenter/stegvelger/stegKomponenter/vurderingBostedsland';

const initialState = {
  data: [],
  status: STATUS.NOT_STARTED,
};

// {
//  "referanse": "OFFENTLIGTJENESTEMANN",
//  "avklartefaktaKode": "OFFENTLIGTJENESTEMANN",
//  "fakta": ["TRUE"],
//  "subjektID": null,
//  "begrunnelseKoder": [],
//  "begrunnelseFritekst": null
// },

const avklartefaktaTilObjekt = (avklartfakta, oppfylt, begrunnelseKoder, begrunnelseFritekst) => (
  oppfylt === undefined ? null : {
    referanse: avklartfakta,
//  avklartefaktaKode: "OFFENTLIGTJENESTEMANN",
//  fakta": ["TRUE"],
//  subjektID": null,
//  begrunnelseKoder": [],
//  begrunnelseFritekst": null
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
      console.log(dokument);
      const avklarteFakta = [
        avklartefaktaTilObjekt('OPPHOLDSLAND'),
      ];

      return { ...state, data: { ...state.data, avklaring: { ...avklarteFakta } } };
    }
    default:
      return state;
  }
}
