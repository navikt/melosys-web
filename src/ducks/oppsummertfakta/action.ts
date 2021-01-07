import { OppsummertFaktaVirksomheter } from "Domene";
import * as Types from "./types";

export function oppdaterVirksomheter(virksomheter: OppsummertFaktaVirksomheter): Types.OppdaterVirksomheterAction {
  return {
    type: Types.OPPDATER_VIRKSOMHETER,
    data: virksomheter,
  };
}

export function resetOppsummertFakta(): Types.ResetAction {
  return { type: Types.RESET };
}
