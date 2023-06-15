/**
 * Reducers
 * ----------------------------------------------------------------------------------
 * Dette er Redux-reducere som håndterer state-manipulasjon direkte, basert på
 * action types som sendes inn sammen med dataene.
 */
import { StateSection } from "AppTypes";
import { STATUS } from "../../services";
import * as Types from "./types";
import { kontrollTypes } from "./index";
import { videresendingTypes } from "../videresending";
import { anmodningunntakTypes } from "../anmodningunntak";
import { utpekTypes } from "../utpek";
import { fagsakTypes } from "../fagsaker";

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
    case Types.RESET:
    case utpekTypes.OK:
    case kontrollTypes.OK:
    case videresendingTypes.OK:
    case anmodningunntakTypes.OK:
    case fagsakTypes.OK:
      return initialState;
    default:
      return state;
  }
}
