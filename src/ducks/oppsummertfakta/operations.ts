import { doThenDispatch } from "../../services/utils";

import * as Api from "../../services/api";
import * as Types from "./types";
import * as Actions from "./action";

export function hentOppsummertFakta(behandlingID: number) {
  return doThenDispatch(() => Api.Avklartefakta.hentOppsummering(behandlingID), {
    OK: Types.OK,
    FEILET: Types.FEILET,
    PENDING: Types.PENDING,
  });
}

export function sendVirksomheter(behandlingID: number, virksomheter: Api.Avklartefakta.Virksomheter) {
  return doThenDispatch(() => Api.Avklartefakta.sendVirksomheter(behandlingID, virksomheter), {
    OK: Types.OK,
    FEILET: Types.FEILET,
    PENDING: Types.PENDING,
  });
}

export function resetOppsummertFakta() {
  return Actions.resetOppsummertFakta();
}
