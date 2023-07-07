import { ThunkDispatch } from "redux-thunk";
import { RootState } from "AppTypes";

import { doThenDispatch } from "../../services/utils";
import * as Api from "../../services/api";
import * as Types from "./types";
import * as Actions from "./actions";
import * as Selectors from "./selectors";

import { behandlingerSelectors } from "../behandlinger";

export function hentMedlemskapsperioder(behandlingID: number) {
  return doThenDispatch(() => Api.Medlemskapsperioder.getMedlemskapsperioder(behandlingID), {
    OK: Types.OK_MEDLEMSKAPSPERIODE,
    FEILET: Types.FEILET,
    PENDING: Types.PENDING,
  });
}

export function hentBestemmelse(behandlingID: number) {
  return doThenDispatch(() => Api.Medlemskapsperioder.getBestemmelse(behandlingID), {
    OK: Types.OK_BESTEMMELSE,
    FEILET: Types.FEILET,
    PENDING: Types.PENDING,
  });
}

function opprettMedlemskapsperiode(behandlingID: number, bestemmelse: string) {
  return doThenDispatch(
    () => Api.Medlemskapsperioder.opprettMedlemskapsperioderFraBestemmelse(behandlingID, bestemmelse),
    {
      OK: Types.OK_MEDLEMSKAPSPERIODE,
      FEILET: Types.FEILET,
      PENDING: Types.PENDING,
    }
  );
}

export function oppdaterBestemmelse(bestemmelse: string) {
  return (dispatch: ThunkDispatch<RootState, unknown, Types.Action>) =>
    dispatch(Actions.oppdaterBestemmelse(bestemmelse));
}

export function opprettMedlemskapsperiodeFraBestemmelse() {
  return (dispatch: ThunkDispatch<RootState, unknown, Types.Action>, getState: () => RootState) => {
    const bestemmelse = Selectors.BestemmelseSelector(getState());
    const bid = behandlingerSelectors.BehandlingIDSelector(getState());
    dispatch(opprettMedlemskapsperiode(bid, bestemmelse));
  };
}

export function resetMedlemskapsperioder() {
  return Actions.resetMedlemskapsperioder();
}
