import { doThenDispatch } from "../../services/utils";
import * as Api from "../../services/api";
import * as Types from "./types";
import { tilbakemeldingOperations } from "../tilbakemelding";

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
        dispatch(tilbakemeldingOperations.tilForsidenOgVisTilbakemelding());
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
        dispatch(tilbakemeldingOperations.tilForsidenOgVisTilbakemelding());
      },
    }
  );
}
