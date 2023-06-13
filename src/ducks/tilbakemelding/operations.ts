import { ThunkDispatch } from "redux-thunk";
import { RootState } from "AppTypes";
import { Action } from "redux";

import * as Actions from "./actions";

import { navigeringOperations } from "../navigering";
import { erFeatureToggleEnabled } from "../../featuretoggle";
import { MELOSYS_TILBAKEMELDING_TIL_SAKSBEHANDLER } from "../../featuretoggle/toggleNavn";

export const visTilbakemelding =
  (tekst: string = "Handling vellykket!") =>
  (dispatch: ThunkDispatch<RootState, unknown, Action>) =>
    dispatch(Actions.oppdater({ synlig: true, tekst }));

export const skjulTilbakemelding = () => (dispatch: ThunkDispatch<RootState, unknown, Action>) =>
  dispatch(Actions.oppdater({ synlig: false, tekst: "" }));

export const tilForsidenOgVisTilbakemelding =
  (tekst?: string) => (dispatch: ThunkDispatch<RootState, unknown, Action>, getState: () => RootState) => {
    if (erFeatureToggleEnabled(MELOSYS_TILBAKEMELDING_TIL_SAKSBEHANDLER, getState())) {
      dispatch(navigeringOperations.tilForsiden());
      visTilbakemelding(tekst);
    } else {
      dispatch(navigeringOperations.tilForsiden());
    }
  };
