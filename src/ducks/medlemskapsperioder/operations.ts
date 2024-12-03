import { doThenDispatch } from "../../services/utils";
import * as Api from "../../services/api";
import * as Types from "./types";
import * as Actions from "./actions";

export function hentMedlemskapsperioder(behandlingID: number) {
  return doThenDispatch(() => Api.MedlemAvFolketrygden.Medlemskapsperioder.hentMedlemskapsperioder(behandlingID), {
    OK: Types.OK_MEDLEMSKAPSPERIODE,
    FEILET: Types.FEILET,
    PENDING: Types.PENDING,
  });
}

export function opprettMedlemskapsperiode(
  behandlingID: number,
  medlemskapsperiode: Api.MedlemAvFolketrygden.Medlemskapsperioder.OppdaterMedlemskapsperiode,
) {
  return doThenDispatch(
    () => Api.MedlemAvFolketrygden.Medlemskapsperioder.opprettMedlemskapsperioder(behandlingID, medlemskapsperiode),
    {
      OK: Types.OK_OPPRETT_MEDLEMSKAPSPERIODE,
      FEILET: Types.FEILET,
      PENDING: Types.PENDING,
    },
  );
}

export function oppdaterMedlemskapsperiode(
  behandlingID: number,
  medlemskapsId: number,
  medlemskapsperiode: Api.MedlemAvFolketrygden.Medlemskapsperioder.OppdaterMedlemskapsperiode,
) {
  return doThenDispatch(
    () =>
      Api.MedlemAvFolketrygden.Medlemskapsperioder.oppdaterMedlemskapsperioder(
        behandlingID,
        medlemskapsId,
        medlemskapsperiode,
      ),
    {
      OK: Types.OK_OPPDATER_MEDLEMSKAPSPERIODE,
      FEILET: Types.FEILET,
      PENDING: Types.PENDING,
    },
  );
}

export function slettMedlemskapsperiode(behandlingID: number, medlemskapsId: number) {
  return doThenDispatch(
    () => Api.MedlemAvFolketrygden.Medlemskapsperioder.slettMedlemskapsperiode(behandlingID, medlemskapsId),
    {
      OK: Types.OK_SLETT_MEDLEMSKAPSPERIODE,
      FEILET: Types.FEILET,
      PENDING: Types.PENDING,
    },
    {
      mapDispatchData: () => ({
        id: medlemskapsId,
      }),
    },
  );
}

export function slettMedlemskapsperioder(behandlingID: number) {
  return doThenDispatch(() => Api.MedlemAvFolketrygden.Medlemskapsperioder.slettMedlemskapsperioder(behandlingID), {
    OK: Types.OK_SLETT_ALLE_MEDLEMSKAPSPERIODER,
    FEILET: Types.FEILET,
    PENDING: Types.PENDING,
  });
}

export function resetMedlemskapsperioder() {
  return Actions.resetMedlemskapsperioder();
}

export function opprettMedlemskapsperioderForslag(behandlingID: number, bestemmelse: string) {
  return doThenDispatch(
    () => Api.MedlemAvFolketrygden.Medlemskapsperioder.opprettForeslåtteMedlemskapsperioder(behandlingID, bestemmelse),
    {
      OK: Types.OK_MEDLEMSKAPSPERIODE,
      FEILET: Types.FEILET,
      PENDING: Types.PENDING,
    },
  );
}
