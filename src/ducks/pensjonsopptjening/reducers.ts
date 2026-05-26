import { STATUS } from "../../services/utils";
import * as Types from "./types";

interface State {
  status: string;
  data: Types.PensjonsopptjeningRespons | Record<string, never>;
}

const initialState: State = {
  status: STATUS.NOT_STARTED,
  data: {},
};

export default function reducer(state: State = initialState, action: Types.Action): State {
  switch (action.type) {
    case Types.PENDING:
      return { ...state, status: STATUS.PENDING };
    case Types.FEILET:
      return { ...state, status: STATUS.ERROR, data: action.data?.data ?? {} };
    case Types.OK:
      return { ...state, status: STATUS.OK, data: action.data };
    case Types.RESET:
      return initialState;
    default:
      return state;
  }
}
