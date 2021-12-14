import { StateSection } from "AppTypes";

import { STATUS } from "../../services/utils";
import * as Types from "./types";
import { utpekTypes } from "../utpek";
import { vedtakTypes } from "../vedtak";
import { videresendingTypes } from "../videresending";
import { anmodningunntakTypes } from "../anmodningunntak";

const initialState: StateSection<Types.Data> = {
  status: STATUS.NOT_STARTED,
  data: {},
};

/*
  Vi ønsker å få tak i resultatet fra det siste feilede api-kallet blant typene nedenfor.
  Vi resetter i tillegg state dersom et av api-kallene er vellykket.
*/
// eslint-disable-next-line default-param-last
export default function reducer(state = initialState, action: Types.Action): StateSection<Types.Data> {
  switch (action.type) {
    case utpekTypes.FEILET:
    case vedtakTypes.FEILET:
    case videresendingTypes.FEILET:
    case anmodningunntakTypes.FEILET:
      return { ...state, status: STATUS.ERROR, data: { ...state.data, ...action.data } };
    case utpekTypes.OK:
    case vedtakTypes.OK:
    case videresendingTypes.OK:
    case anmodningunntakTypes.OK:
      return { ...initialState, status: STATUS.OK };
    default:
      return state;
  }
}
