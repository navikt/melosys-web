import * as Types from "./types";
import * as Api from "../../services/api";

export function oppdaterVirksomheter(virksomheter: Api.Avklartefakta.Virksomheter): Types.OppdaterVirksomheterAction {
  return {
    type: Types.OPPDATER_VIRKSOMHETER,
    data: virksomheter,
  };
}

export function resetOppsummertFakta(): Types.ResetAction {
  return { type: Types.RESET };
}
