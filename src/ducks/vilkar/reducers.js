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

const vilkarTilObjekt = (vilkaar, oppfylt, begrunnelseKoder, begrunnelseFritekst) => ({
  vilkaar,
  oppfylt,
  begrunnelseKoder,
  begrunnelseFritekst: begrunnelseFritekst || null,
});

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
    case Types.OPPDATER_VILKAR: {
      // Kommer inn som objekt. Må inn i storen som array.
      return {
        data: [
          vilkarTilObjekt('ART12_1_FORUTGAAENDE_MEDLEMSKAP', action.data.vilkar.forutgaendeMedlemskap, action.data.vilkar.forutgaendeMedlemskapBegrunnelser),
          vilkarTilObjekt('VESENTLIG_VIRKSOMHET', action.data.vilkar.vesentligVirksomhet, action.data.vilkar.vesentligVirksomhetBegrunnelser),
          vilkarTilObjekt('BOSATT_I_NORGE', action.data.vilkar.bosattINorge, action.data.vilkar.bosattINorgeBegrunnelser),
        ],
      };
    }
    default:
      return state;
  }
}
