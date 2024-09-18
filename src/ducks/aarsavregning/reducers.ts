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
  data: {},
};

export default function reducer(state = initialState, action: Types.Action) {
  switch (action.type) {
    case Types.OK:
      return { ...state, status: STATUS.OK, data: action.data };
    case Types.RESET:
      return initialState;
    default:
      return state;
  }
}
