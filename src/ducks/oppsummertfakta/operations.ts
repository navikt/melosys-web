import { AppThunk } from "AppTypes";
import { OppsummertFaktaMedfolgendeFamilie, OppsummertFaktaVirksomheter } from "Domene";
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

export function sendVirksomheter(behandlingID: number, virksomheter: OppsummertFaktaVirksomheter) {
  return doThenDispatch(() => Api.Avklartefakta.sendVirksomheter(behandlingID, virksomheter), {
    OK: Types.OK,
    FEILET: Types.FEILET,
    PENDING: Types.PENDING,
  });
}

export function sendMedfolgendeFamilie(behandlingID: number, medfolgendeFamilie: OppsummertFaktaMedfolgendeFamilie) {
  return doThenDispatch(() => Api.Avklartefakta.sendMedfolgendeFamilie(behandlingID, medfolgendeFamilie), {
    OK: Types.OK,
    FEILET: Types.FEILET,
    PENDING: Types.PENDING,
  });
}

export function oppdaterVirksomheterState(
  virksomheter: OppsummertFaktaVirksomheter
): AppThunk<Types.Action, Types.Action> {
  return (dispatch) => dispatch(Actions.oppdaterVirksomheter(virksomheter));
}

export function resetOppsummertFakta() {
  return Actions.resetOppsummertFakta();
}
