/**
 * Reducers
 * ----------------------------------------------------------------------------------
 * Dette er Redux-reducere som håndterer state-manipulasjon direkte, basert på
 * action types som sendes inn sammen med dataene.
 */
import { STATUS } from "../../services/utils";
import * as Types from "./types";

const initialState = {
  status: STATUS.NOT_STARTED,
  data: {
    fakturaserie: [],
    fakturainfo: [],
  },
};

export default function reducer(state = initialState, action: Types.Action) {
  switch (action.type) {
    case Types.PENDING:
      return { ...state, status: STATUS.PENDING };
    case Types.FEILET:
      return { ...state, status: STATUS.ERROR, data: action.data.data };
    case Types.OKFakturaserie:
      return { ...state, status: STATUS.OK, data: { ...state.data, fakturaserie: action.data } };
    case Types.OKFakturainfo:
      return { ...state, status: STATUS.OK, data: { ...state.data, fakturainfo: action.data } };
    default:
      return state;
  }
}
