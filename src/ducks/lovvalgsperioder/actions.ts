import * as Types from "./types";
import * as Api from "../../services/api";
/**
 * Actions
 * -----------------------------------------------------------------------
 * Dette er action creators som returnerer Redux-klargjorte actions
 * uten support for asynkrone kall.
 */

export function oppdaterLovvalgsperioderState(lovvalgsperioder: Api.Lovvalgsperioder.Lovvalgsperiode[]): Types.Action {
  return {
    type: Types.OPPDATER_LOVVALGSPERIODER,
    data: lovvalgsperioder,
  };
}

/** Tømmer avklartefakta-state når komponenten unmounter
 *
 * @returns {{type: *}}
 */
export function resetLovvalgsperioderState(): Types.Action {
  return { type: Types.RESET };
}

export function endrePeriode(fomDato: string, tomDato?: string): Types.Action {
  return {
    type: Types.ENDRE_PERIODE,
    data: {
      fomDato,
      tomDato,
    },
  };
}
