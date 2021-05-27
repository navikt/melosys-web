import { doThenDispatch } from "../../services/utils";
import * as Api from "../../services/api";
import * as Types from "./types";

export function hentStegData(behandlingID: number) {
  return doThenDispatch(() => Api.Trygdeavtale.hentStegData(behandlingID), {
    OK: Types.OK,
    FEILET: Types.FEILET,
    PENDING: Types.PENDING,
  });
}

export function sendStegData(behandlingID: number, data: Api.Trygdeavtale.StegDataReqDto) {
  return doThenDispatch(() => Api.Trygdeavtale.sendStegData(behandlingID, data), {
    OK: Types.OK,
    FEILET: Types.FEILET,
    PENDING: Types.PENDING,
  });
}
