import { STATUS } from "../../services";
import * as Types from "./types";

export const initialState = {
  status: STATUS.NOT_STARTED,
  data: [],
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
