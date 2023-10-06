import { ThunkDispatch } from "redux-thunk";
import { RootState } from "AppTypes";

import { doThenDispatch } from "../../services/utils";
import * as Api from "../../services/api";
import * as Types from "./types";
import * as Actions from "./actions";

export function hentMedlemskapsperioder(behandlingID: number) {
  return doThenDispatch(() => Api.MedlemAvFolketrygden.Medlemskapsperioder.getMedlemskapsperioder(behandlingID), {
    OK: Types.OK_MEDLEMSKAPSPERIODE,
    FEILET: Types.FEILET,
    PENDING: Types.PENDING,
  });
}

export function opprettMedlemskapsperiode(
  behandlingID: number,
  medlemskapsperiode: Api.MedlemAvFolketrygden.Medlemskapsperioder.OppdaterMedlemskapsperiode
) {
  return doThenDispatch(
    () => Api.MedlemAvFolketrygden.Medlemskapsperioder.postMedlemskapsperioder(behandlingID, medlemskapsperiode),
    {
      OK: Types.OK_OPPRETT_MEDLEMSKAPSPERIODE,
      FEILET: Types.FEILET,
      PENDING: Types.PENDING,
    }
  );
}

export function oppdaterMedlemskapsperiode(
  behandlingID: number,
  medlemskapsId: number,
  medlemskapsperiode: Api.MedlemAvFolketrygden.Medlemskapsperioder.OppdaterMedlemskapsperiode
) {
  return doThenDispatch(
    () =>
      Api.MedlemAvFolketrygden.Medlemskapsperioder.putMedlemskapsperioder(
        behandlingID,
        medlemskapsId,
        medlemskapsperiode
      ),
    {
      OK: Types.OK_OPPDATER_MEDLEMSKAPSPERIODE,
      FEILET: Types.FEILET,
      PENDING: Types.PENDING,
    }
  );
}

export function slettMedlemskapsperiode(behandlingID: number, medlemskapsId: number) {
  return doThenDispatch(
    () => Api.MedlemAvFolketrygden.Medlemskapsperioder.deleteMedlemskapsperioder(behandlingID, medlemskapsId),
    {
      OK: Types.OK_SLETT_MEDLEMSKAPSPERIODE,
      FEILET: Types.FEILET,
      PENDING: Types.PENDING,
    },
    {
      mapDispatchData: () => ({
        id: medlemskapsId,
      }),
    }
  );
}

export function resetMedlemskapsperioder() {
  return Actions.resetMedlemskapsperioder();
}

// Deprecated
export function hentBestemmelseGammel(behandlingID: number) {
  return doThenDispatch(() => Api.MedlemAvFolketrygden.Medlemskapsperioder.getBestemmelse(behandlingID), {
    OK: Types.OK_BESTEMMELSE,
    FEILET: Types.FEILET,
    PENDING: Types.PENDING,
  });
}

export function hentBestemmelse(behandlingID: number) {
  return doThenDispatch(() => Api.MedlemAvFolketrygden.Bestemmelser.getBestemmelse(behandlingID), {
    OK: Types.OK_BESTEMMELSE,
    FEILET: Types.FEILET,
    PENDING: Types.PENDING,
  });
}

export function lagreBestemmelse(behandlingID: number, bestemmelse: string) {
  return doThenDispatch(() => Api.MedlemAvFolketrygden.Bestemmelser.postBestemmelse(behandlingID, bestemmelse), {
    OK: Types.OK_BESTEMMELSE,
    FEILET: Types.FEILET,
    PENDING: Types.PENDING,
  });
}

// Deprecated
export function opprettMedlemskapsperiodeFraBestemmelse(behandlingID: number, bestemmelse: string) {
  return doThenDispatch(
    () =>
      Api.MedlemAvFolketrygden.Medlemskapsperioder.opprettMedlemskapsperioderFraBestemmelse(behandlingID, bestemmelse),
    {
      OK: Types.OK_MEDLEMSKAPSPERIODE,
      FEILET: Types.FEILET,
      PENDING: Types.PENDING,
    }
  );
}

export function opprettMedlemskapsperioderForslag(behandlingID: number) {
  return doThenDispatch(
    () => Api.MedlemAvFolketrygden.Medlemskapsperioder.opprettForeslåtteMedlemskapsperioder(behandlingID),
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
