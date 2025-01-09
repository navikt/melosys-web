import { AppThunk, RootState } from "AppTypes";
import { ThunkDispatch } from "redux-thunk";

import { doThenDispatch } from "../../services/utils";
import * as Api from "../../services/api";
import * as Types from "./types";
import * as Actions from "./actions";
import { navigeringOperations } from "../navigering";

export function send(
  saksnummer: string,
  videresending: Api.Fagsaker.fagsak.VideresendReqDto,
): AppThunk<Promise<Types.Action>, Types.Action> {
  return doThenDispatch(
    () => Api.Fagsaker.fagsak.videresend(saksnummer, videresending),
    {
      OK: Types.OK,
      FEILET: Types.FEILET,
      PENDING: Types.PENDING,
    },
    {
      success: (dispatch: ThunkDispatch<RootState, unknown, Types.Action>) => {
        dispatch(navigeringOperations.tilForsiden());
      },
    },
  );
}

export function reset(): AppThunk<Types.Action, Types.Action> {
  return (dispatch) => dispatch(Actions.reset());
}
