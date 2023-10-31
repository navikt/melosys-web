import { StateSection } from "AppTypes";

import { STATUS } from "../../services";
import * as Types from "./types";
import { utpekTypes } from "../utpek";
import { vedtakTypes } from "../vedtak";
import { videresendingTypes } from "../videresending";
import { anmodningunntakTypes } from "../anmodningunntak";
import { fagsakTypes } from "../fagsaker";
import { kontrollTypes } from "../kontroll";
import { trygdeavgiftTypes } from "../trygdeavgift";

const initialState: StateSection<Types.Data> = {
  status: STATUS.NOT_STARTED,
  data: {},
};

/*
  Vi ønsker å få tak i resultatet fra det siste feilede api-kallet blant typene nedenfor.
  Vi resetter i tillegg state dersom et av api-kallene er vellykket.
*/
export default function reducer(state = initialState, action: Types.Action): StateSection<Types.Data> {
  switch (action.type) {
    case Types.RESET:
      return initialState;
    case utpekTypes.FEILET:
    case vedtakTypes.FEILET:
    case videresendingTypes.FEILET:
    case anmodningunntakTypes.FEILET:
    case fagsakTypes.FEILET:
    case trygdeavgiftTypes.FEILET:
    case kontrollTypes.FEILET:
      return { ...state, status: STATUS.ERROR, data: { ...state.data, ...action.data } };
    case utpekTypes.OK:
    case vedtakTypes.OK:
    case videresendingTypes.OK:
    case anmodningunntakTypes.OK:
    case fagsakTypes.OK:
    case trygdeavgiftTypes.OK:
    case kontrollTypes.OK:
      return { ...initialState, status: STATUS.OK };
    default:
      return state;
  }
}
