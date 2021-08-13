import { doThenDispatch } from "../../services/utils";
import * as Api from "../../services/api";
import * as Types from "./types";
import * as DucksUtils from "../utils";

import { modalerOperations } from "../modaler";
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
        dispatch(modalerOperations.skjulValidering());
        dispatch(navigeringOperations.tilForsiden());
      },
      error: (dispatch, data) => {
        if (DucksUtils.harFeilkode(data)) {
          dispatch(modalerOperations.visValidering());
        }
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
