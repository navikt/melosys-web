import * as Types from "./types";
import * as Api from "../../services/api";

export function oppdaterLovvalgsperioderState(
  lovvalgsperioder: Api.Lovvalgsperioder.LovvalgsperiodeDto[],
): Types.OppdaterLovvalgsperioderAction {
  return {
    type: Types.OPPDATER_LOVVALGSPERIODER,
    data: lovvalgsperioder,
  };
}

export function resetLovvalgsperioderState(): Types.ResetAction {
  return { type: Types.RESET };
}

export function endrePeriode(fomDato: string, tomDato?: string): Types.EndrePeriodeAction {
  return {
    type: Types.ENDRE_PERIODE,
    data: {
      fomDato,
      tomDato,
    },
  };
}
