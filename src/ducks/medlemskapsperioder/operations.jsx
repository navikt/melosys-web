import { doThenDispatch } from "../../services/utils";
import * as Api from "../../services/api";
import * as Types from "./types";
import * as Actions from "./actions";
import * as Selectors from "./selectors";

import { behandlingerSelectors } from "../behandlinger";

export function hentMedlemskapsperioder(behandlingID) {
  return doThenDispatch(() => Api.Medlemskapsperioder.getMedlemskapsperioder(behandlingID), {
    OK: Types.OK,
    FEILET: Types.FEILET,
    PENDING: Types.PENDING,
  });
}

function opprettMedlemskapsperiode(behandlingID, bestemmelse) {
  return doThenDispatch(
    () => Api.Medlemskapsperioder.opprettMedlemskapsperioderFraBestemmelse(behandlingID, bestemmelse),
    {
      OK: Types.OK,
      FEILET: Types.FEILET,
      PENDING: Types.PENDING,
    }
  );
}

export function oppdaterBestemmelse(bestemmelse) {
  return (dispatch) => dispatch(Actions.oppdaterBestemmelse(bestemmelse));
}

export function opprettMedlemskapsperiodeFraBestemmelse() {
  return (dispatch, getState) => {
    const bestemmelse = Selectors.BestemmelseSelector(getState());
    const bid = behandlingerSelectors.BehandlingIDSelector(getState());
    dispatch(opprettMedlemskapsperiode(bid, bestemmelse));
  };
}

export function resetMedlemskapsperioder() {
  return Actions.resetMedlemskapsperioder();
}
