/**
 * Reducers
 * ----------------------------------------------------------------------------------
 * Dette er Redux-reducere som håndterer state-manipulasjon direkte, basert på
 * action types som sendes inn sammen med dataene.
 */
import { StateSection } from "AppTypes";
import { STATUS } from "../../services/utils";
import * as Types from "./types";

const initialState: StateSection<Types.Data> = {
  status: STATUS.NOT_STARTED,
  data: {},
};

export default function reducer(state = initialState, action: Types.Action) {
  switch (action.type) {
    case Types.PENDING:
      return { ...state, status: STATUS.PENDING };
    case Types.FEILET:
      return { ...state, status: STATUS.ERROR, data: action.data };
    case Types.OK:
      return { ...state, status: STATUS.OK, data: action.data };
    default:
      return state;
  }
}
