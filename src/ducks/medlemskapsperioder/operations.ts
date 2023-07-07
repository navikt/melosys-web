import { ThunkDispatch } from "redux-thunk";
import { RootState } from "AppTypes";

import { doThenDispatch } from "../../services/utils";
import * as Api from "../../services/api";
import * as Types from "./types";
import * as Actions from "./actions";

export function hentMedlemskapsperioder(behandlingID: number) {
  return doThenDispatch(() => Api.Medlemskapsperioder.getMedlemskapsperioder(behandlingID), {
    OK: Types.OK_MEDLEMSKAPSPERIODE,
    FEILET: Types.FEILET,
    PENDING: Types.PENDING,
  });
}

export function opprettMedlemskapsperiode(
  behandlingID: number,
  medlemskapsperiode: Api.Medlemskapsperioder.OppdaterMedlemskapsperiode
) {
  return doThenDispatch(() => Api.Medlemskapsperioder.postMedlemskapsperioder(behandlingID, medlemskapsperiode), {
    OK: Types.OK_OPPRETT_MEDLEMSKAPSPERIODE,
    FEILET: Types.FEILET,
    PENDING: Types.PENDING,
  });
}

export function oppdaterMedlemskapsperiode(
  behandlingID: number,
  medlemskapsId: number,
  medlemskapsperiode: Api.Medlemskapsperioder.OppdaterMedlemskapsperiode
) {
  return doThenDispatch(
    () => Api.Medlemskapsperioder.putMedlemskapsperioder(behandlingID, medlemskapsId, medlemskapsperiode),
    {
      OK: Types.OK_OPPDATER_MEDLEMSKAPSPERIODE,
      FEILET: Types.FEILET,
      PENDING: Types.PENDING,
    }
  );
}

export function hentBestemmelse(behandlingID: number) {
  return doThenDispatch(() => Api.Medlemskapsperioder.getBestemmelse(behandlingID), {
    OK: Types.OK_BESTEMMELSE,
    FEILET: Types.FEILET,
    PENDING: Types.PENDING,
  });
}

export function opprettMedlemskapsperiodeFraBestemmelse(behandlingID: number, bestemmelse: string) {
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

export function resetMedlemskapsperioder() {
  return Actions.resetMedlemskapsperioder();
}
