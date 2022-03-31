import { doThenDispatch } from "../../services/utils";
import * as Api from "../../services/api";
import * as Types from "./types";
import { behandlingerSelectors } from "../behandlinger";
import { navigeringOperations } from "../navigering";

export function utpek(saksnummer, body) {
  return doThenDispatch(
    () => Api.Fagsaker.fagsak.utpek(saksnummer, body),
    {
      OK: Types.OK,
      FEILET: Types.FEILET,
      PENDING: Types.PENDING,
    },
    {
      success: (dispatch) => {
        dispatch(navigeringOperations.tilForsiden());
      },
    }
  );
}

export function avvis(body) {
  return async (dispatch, getState) => {
    const behandlingID = behandlingerSelectors.BehandlingIDSelector(getState());

    await Api.Saksflyt.Utpeking.avvis(behandlingID, body);
    dispatch(navigeringOperations.tilForsiden());
  };
}
