/**
 * Reducers
 * ----------------------------------------------------------------------------------
 * Dette er Redux-reducere som håndterer state-manipulasjon direkte, basert på
 * action types som sendes inn sammen med dataene.
 */

import { STATUS } from "../../services";
import * as Types from "./types";

const initialState = {
  status: STATUS.NOT_STARTED,
  data: {},
};

export default function reducer(state = initialState, action = {}) {
  switch (action.type) {
    case Types.PENDING:
      return { ...state, status: STATUS.PENDING };
    case Types.FEILET:
      return { ...state, status: STATUS.ERROR, data: action.data };
    case Types.OK: {
      return { ...state, status: STATUS.OK, data: action.data };
    }
    case Types.OPPDATER_BEHANDLINGER: {
      const { tidligeremedlemskap: tidligere_medlemsperiode_ids } = action.data;
      if (!tidligere_medlemsperiode_ids) return { ...state };
      return { ...state, data: { tidligere_medlemsperiode_ids } };
    }
    default:
      return state;
  }
}
