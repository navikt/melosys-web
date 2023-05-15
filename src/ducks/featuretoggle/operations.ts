import { AppThunk, RootState } from "AppTypes";
import { ThunkDispatch } from "redux-thunk";

import { doThenDispatch, setCachedItem } from "../../services/utils";
import * as Api from "../../services/api";
import * as Types from "./types";
import * as Actions from "./actions";
import { FEATURE_TOGGLE, alleToggleNavn } from "../../featuretoggle/toggleNavn";

export function hent() {
  return doThenDispatch(
    () => Api.Featuretoggle.hent(alleToggleNavn),
    {
      OK: Types.OK,
      FEILET: Types.FEILET,
      PENDING: Types.PENDING,
    },
    {
      success: (dispatch: ThunkDispatch<RootState, unknown, Types.Action>, alleToggles: any) => {
        setCachedItem(FEATURE_TOGGLE, JSON.stringify(alleToggles));
      },
    }
  );
}

export function reset(): AppThunk<Types.Action, Types.Action> {
  return (dispatch) => dispatch(Actions.reset());
}
