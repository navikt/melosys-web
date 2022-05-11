import { doThenDispatch } from "../../services/utils";
import * as Api from "../../services/api";
import * as Types from "./types";
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

export function avvis(behandlingID, body) {
  return doThenDispatch(
    () => Api.Saksflyt.Utpeking.avvis(behandlingID, body),
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
