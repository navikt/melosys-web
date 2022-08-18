/**
 * Reducers
 * ----------------------------------------------------------------------------------
 * Dette er Redux-reducere som håndterer state-manipulasjon direkte, basert på
 * action types som sendes inn sammen med dataene.
 */
import * as Types from "./types";

import { STATUS } from "../../services/utils";

export const initialState = {
  data: {},
  status: STATUS.NOT_STARTED,
};

/**
 * Default reducer som i hovedsak håndterer lagring og feiling av inkomne data i tillegg til
 * manipulasjon og oppdatering av state-data.
 * @param state Object Default state før noen data er forsøkt sendt til reducer.
 * @param action Object Bestående av type (action type) og data.
 * @returns {{data: {}, status: string}}
 */
export default function reducer(state = initialState, action = {}) {
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
      return initialState;
    case Types.HENTET_MULIGE_SAKSTEMA: {
      const muligeSakstemaer = action.data;
      if (!muligeSakstemaer) return { ...state };
      return { ...state, data: { ...state.data, muligeSakstemaer } };
    }
    case Types.HENTET_MULIGE_SAKSTYPE: {
      const muligeSakstyper = action.data;
      if (!muligeSakstyper) return { ...state };
      return { ...state, data: { ...state.data, muligeSakstyper } };
    }
    default:
      return state;
  }
}
