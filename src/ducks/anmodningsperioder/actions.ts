import * as Api from "../../services/api";
import * as Types from "./types";

export function oppdaterAnmodningsperioder(
  anmodningsperioder: Api.Anmodningsperioder.Anmodningsperiode[]
): Types.OppdaterAnmodningsperioderAction {
  return {
    type: Types.OPPDATER_ANMODNINGSPERIODER,
    anmodningsperioder,
  };
}

export function resetAnmodningsperioderState(): Types.ResetAction {
  return { type: Types.RESET };
}
