/**
 * Reducers
 * ----------------------------------------------------------------------------------
 * Dette er Redux-reducere som håndterer state-manipulasjon direkte, basert på
 * action types som sendes inn sammen med dataene.
 */

import { STATUS } from "../../services";

import * as Types from "./types";

export const initialState = {
  data: [],
  status: STATUS.NOT_STARTED,
  error: undefined,
};

const finnIndexTilPeriode = (perioder, action) =>
  perioder?.findIndex((periode) => periode.periodeID === action.data.periodeID);

export default function reducer(state = initialState, action = {}) {
  switch (action.type) {
    case Types.PENDING:
      return { ...state, status: STATUS.PENDING };
    case Types.FEILET:
      return { ...state, status: STATUS.ERROR, error: action.data };
    case Types.OK:
      return {
        ...state,
        status: STATUS.OK,
        data: action.data,
      };
    case Types.RESET:
      return { ...initialState };
    case Types.OPPDATER_LOVVALGSPERIODER: {
      return {
        data: [...action.data],
        status: STATUS.OK,
      };
    }
    case Types.OK_OPPDATER_LOVVALGSPERIODE: {
      const lovvalgsperioder = [...state.data];
      const oppdatertPeriodeId = finnIndexTilPeriode(lovvalgsperioder, action);
      if (oppdatertPeriodeId !== -1) lovvalgsperioder[oppdatertPeriodeId] = action.data;
      return {
        ...state,
        data: lovvalgsperioder,
        status: STATUS.OK,
      };
    }
    case Types.OK_SLETT_LOVVALGSPERIODE: {
      const lovvalgsperioder = [...state.data];
      const slettetPeriodeId = finnIndexTilPeriode(lovvalgsperioder, action);
      if (slettetPeriodeId !== -1) lovvalgsperioder.splice(slettetPeriodeId, 1);
      return {
        ...state,
        data: lovvalgsperioder,
        status: STATUS.OK,
      };
    }
    case Types.ENDRE_PERIODE: {
      return {
        ...state,
        data: [
          {
            ...state.data[0],
            fomDato: action.data.fomDato,
            tomDato: action.data.tomDato,
          },
        ],
      };
    }
    default:
      return state;
  }
}
