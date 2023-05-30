import { AppThunk } from "AppTypes";

import { doThenDispatch } from "../../services/utils";
import * as Api from "../../services/api";
import * as Types from "./types";
import * as Actions from "./actions";
import { alleToggleNavn } from "../../featuretoggle/toggleNavn";

export function hent() {
  return doThenDispatch(() => Api.Featuretoggle.hent(alleToggleNavn), {
    OK: Types.OK,
    FEILET: Types.FEILET,
    PENDING: Types.PENDING,
  });
}

export function reset(): AppThunk<Types.Action, Types.Action> {
  return (dispatch) => dispatch(Actions.reset());
}
