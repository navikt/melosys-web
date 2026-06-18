import { STATUS } from "../../services";
import * as Types from "./types";

interface State {
  status: string;
  data: Types.PensjonsopptjeningRespons | Record<string, never>;
  feil?: unknown;
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
      return { ...state, status: STATUS.ERROR, data: {}, feil: action.data };
    case Types.OK:
      return { ...state, status: STATUS.OK, data: action.data, feil: undefined };
    case Types.RESET:
      return initialState;
    default:
      return state;
  }
}
