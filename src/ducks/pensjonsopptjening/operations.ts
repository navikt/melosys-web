import { ThunkDispatch } from "redux-thunk";
import { RootState } from "AppTypes";

import * as Api from "../../services/api";
import * as Types from "./types";
import * as Actions from "./actions";

import { behandlingerSelectors } from "../behandlinger";

export function hentPensjonsopptjening(behandlingID: number) {
  return async (dispatch: ThunkDispatch<RootState, unknown, Types.Action>, getState: () => RootState) => {
    dispatch({ type: Types.PENDING });
    try {
      const data = await Api.Pensjonsopptjening.hentPensjonsopptjening(behandlingID);
      if (behandlingerSelectors.BehandlingIDSelector(getState()) === behandlingID) {
        dispatch({ type: Types.OK, data });
      }
    } catch (error) {
      if (behandlingerSelectors.BehandlingIDSelector(getState()) === behandlingID) {
        dispatch({ type: Types.FEILET, data: error });
      }
    }
  };
}

export function resetPensjonsopptjening() {
  return Actions.resetPensjonsopptjening();
}
