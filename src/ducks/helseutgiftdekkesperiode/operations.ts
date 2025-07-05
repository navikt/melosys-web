import { doThenDispatch } from "../../services/utils";

import * as Api from "../../services/api";
import * as Types from "./types";
import { HelseutgiftDekkesPeriodeDto } from "../../services/modules/helseutgiftDekkesPeriode/helseutgiftDekkesPeriode";

export function hentHelseutgiftDekkesPeriode(behandlingresultatID: number) {
  return doThenDispatch(() => Api.HelseutgiftDekningPeriode.hentHelseutgiftDekkesPeriode(behandlingresultatID), {
    OK: Types.OK,
    FEILET: Types.FEILET,
    PENDING: Types.PENDING,
  });
}

export function oppdaterEllerOpprettHelseutgiftDekkesPeriode(
  behandlingresultatID: number,
  data: HelseutgiftDekkesPeriodeDto,
  erNyHelseutgiftPeriode: boolean,
) {
  if (erNyHelseutgiftPeriode) {
    return opprettHelseutgiftDekkesPeriode(behandlingresultatID, data);
  } else {
    return oppdaterHelseutgiftDekkesPeriode(behandlingresultatID, data);
  }
}

function opprettHelseutgiftDekkesPeriode(behandlingresultatID: number, data: HelseutgiftDekkesPeriodeDto) {
  return doThenDispatch(
    () => Api.HelseutgiftDekningPeriode.opprettHelseutgiftDekkesPeriode(behandlingresultatID, data),
    {
      OK: Types.OK,
      FEILET: Types.FEILET,
      PENDING: Types.PENDING,
    },
  );
}

function oppdaterHelseutgiftDekkesPeriode(behandlingresultatID: number, data: HelseutgiftDekkesPeriodeDto) {
  return doThenDispatch(
    () => Api.HelseutgiftDekningPeriode.oppdaterHelseutgiftDekkesPeriode(behandlingresultatID, data),
    {
      OK: Types.OK,
      FEILET: Types.FEILET,
      PENDING: Types.PENDING,
    },
  );
}
