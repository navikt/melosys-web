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

/* eslint no-unused-vars: off */
const lovvalgsperiodeTilObjekt = (lovvalgBestemmelse, unntakFraBestemmelse, innvilgelsesResultat, lovvalgsland, unntakFraLovvalgsland, trygdeDekning, medlemskapstype) => (
  lovvalgBestemmelse === undefined ? null : {
    lovvalgBestemmelse,
    unntakFraBestemmelse,
    innvilgelsesResultat,
    lovvalgsland,
    unntakFraLovvalgsland,
    trygdeDekning,
    medlemskapstype,
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
    case Types.RESET:
      return { ...initialState };
    case Types.OPPDATER_LOVVALGSPERIODER: {
      // Gjennomgå alle vilkår som kan være satt. Dersom de er 'undefined', vil det si at
      // saksbehandler ikke har vært innom denne vurderingen og kanskje aldri kommer tid. Siden
      // det da ikke er et vilkår som er vurdert, skal det heller ikke inn i modellen eller sendes backend.
      const lovvalgsperioderArray = [
      ].filter(lovvalgsperiode => lovvalgsperiode !== null);

      return {
        data: lovvalgsperioderArray,
      };
    }
    default:
      return state;
  }
}
