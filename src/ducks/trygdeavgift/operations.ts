import { doThenDispatch } from "../../services/utils";
import * as Api from "../../services/api";
import * as Types from "./types";
import * as Actions from "./actions";

export function beregnTrygdeavgift(behandlingID: number) {
  return doThenDispatch(() => Api.Trygdeavgift.beregnTrygdeavgift(behandlingID), {
    OK: Types.OK,
    FEILET: Types.FEILET,
    PENDING: Types.FEILET,
  });
}

export function hentBeregnetTrygdeavgift(behandlingID: number) {
  return doThenDispatch(() => Api.Trygdeavgift.hentBeregnetTrygdeavgift(behandlingID), {
    OK: Types.OK,
    FEILET: Types.FEILET,
    PENDING: Types.FEILET,
  });
}

export function resetTrygdeavgiftState() {
  return Actions.resetTrygdeavgiftState();
}
