import { STATUS } from "../../services/utils";
import * as Types from "./types";

const initialState = {
  status: STATUS.NOT_STARTED,
  data: {
    synlig: false,
  },
};

export default function reducer(state = initialState, action = {}) {
  switch (action.type) {
    case Types.OPPDATER_VIS_MENYPANEL: {
      return {
        ...state,
        status: STATUS.OK,
        data: {
          synlig: action.data.synlig,
        },
      };
    }
    default:
      return state;
  }
}
