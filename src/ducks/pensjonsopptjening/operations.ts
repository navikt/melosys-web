import { doThenDispatch } from "../../services/utils";
import * as Api from "../../services/api";
import * as Types from "./types";
import * as Actions from "./actions";

export function hentPensjonsopptjening(behandlingID: number) {
  return doThenDispatch(() => Api.Pensjonsopptjening.hentPensjonsopptjening(behandlingID), {
    OK: Types.OK,
    FEILET: Types.FEILET,
    PENDING: Types.PENDING,
  });
}

export function resetPensjonsopptjening() {
  return Actions.resetPensjonsopptjening();
}
