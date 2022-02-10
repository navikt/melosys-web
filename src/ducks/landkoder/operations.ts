import { doThenDispatch } from "../../services/utils";
import * as Api from "../../services/api";
import * as Types from "./types";

export function hentLandkoder() {
  return doThenDispatch(() => Api.Kodeverk.hentLandkoderIso2(), {
    OK: Types.OK,
    FEILET: Types.FEILET,
    PENDING: Types.PENDING,
  });
}
