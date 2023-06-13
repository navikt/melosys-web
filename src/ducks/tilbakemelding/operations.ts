import { ThunkDispatch } from "redux-thunk";
import { RootState } from "AppTypes";
import { Action } from "redux";
import * as Actions from "./actions";
import { navigeringOperations } from "../navigering";

export const visTilbakemelding =
  (tekst: string = "Handling vellykket!") =>
  (dispatch: ThunkDispatch<RootState, unknown, Action>) =>
    dispatch(Actions.oppdater({ synlig: true, tekst }));

export const skjulTilbakemelding = () => (dispatch: ThunkDispatch<RootState, unknown, Action>) =>
  dispatch(Actions.oppdater({ synlig: false, tekst: "" }));

export const tilForsidenOgVisTilbakemelding =
  (tekst: string = "Handling vellykket!") =>
  (dispatch: ThunkDispatch<RootState, unknown, Action>) => {
    dispatch(navigeringOperations.tilForsiden());
    dispatch(Actions.oppdater({ synlig: true, tekst }));
  };
