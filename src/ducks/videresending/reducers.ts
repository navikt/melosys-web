import { StateSection } from "AppTypes";

import { STATUS } from "../../services/utils";
import * as Types from "./types";

const initialState: StateSection<Types.Data> = {
  status: STATUS.NOT_STARTED,
  data: {},
};

export default function reducer(state = initialState, action: Types.Action): StateSection<Types.Data> {
  switch (action.type) {
    case Types.PENDING:
      return { ...state, status: STATUS.PENDING };
    case Types.FEILET:
      return { ...state, status: STATUS.ERROR, data: { ...state.data, ...action.data } };
    case Types.OK:
      return { ...state, status: STATUS.OK, data: action.data };
    case Types.RESET:
      return { ...initialState };
    default:
      return state;
  }
}
