import { doThenDispatch } from "../../services/utils";
import * as Api from "../../services/api";
import * as Types from "./types";

export function hentKodeverkForFolketrygden() {
  return doThenDispatch(() => Api.Kodeverk.hentFolketrygdenKodeverk(), {
    OK: Types.OK,
    FEILET: Types.FEILET,
    PENDING: Types.PENDING,
  });
}
