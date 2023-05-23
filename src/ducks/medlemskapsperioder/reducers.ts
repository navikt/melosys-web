import { StateSection } from "AppTypes";
import { STATUS } from "../../services";
import * as Types from "./types";

export const initialState: StateSection<Types.Data> = {
  data: {},
  status: STATUS.NOT_STARTED,
};

export default function reducer(state = initialState, action: Types.Action): StateSection<Types.Data> {
  switch (action.type) {
    case Types.PENDING:
      return { ...state, status: STATUS.PENDING };
    case Types.FEILET:
      return { ...state, status: STATUS.ERROR, data: action.data };
    case Types.OK_MEDLEMSKAPSPERIODE: {
      return {
        ...state,
        status: STATUS.OK,
        data: {
          ...state.data,
          medlemskapsperioder: action.data,
        },
      };
    }
    case Types.OK_BESTEMMELSE: {
      return {
        ...state,
        status: STATUS.OK,
        data: {
          ...state.data,
          bestemmelse: action.data?.bestemmelse || "",
        },
      };
    }
    case Types.OPPDATER_BESTEMMELSE:
      return {
        ...state,
        data: {
          ...state.data,
          bestemmelse: action.data,
        },
      };
    case Types.RESET:
      return { ...initialState };
    default:
      return state;
  }
}
