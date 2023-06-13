import { StateSection } from "AppTypes";
import { STATUS } from "../../services";
import * as Types from "./types";

const initialState: StateSection<Types.Data> = {
  status: STATUS.NOT_STARTED,
  data: { synlig: false, tekst: "" },
};

export default function reducer(state = initialState, action: Types.Action): StateSection<Types.Data> {
  switch (action.type) {
    case Types.OPPDATER_TILBAKEMELDING:
      return { ...state, status: STATUS.OK, data: action.data };
    default:
      return state;
  }
}
