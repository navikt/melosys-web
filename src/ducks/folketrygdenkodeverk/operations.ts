import { doThenDispatch } from "../../services/utils";
import * as Api from "../../services/api";
import * as Types from "./types";

export function hentKodeverkForFolketrygden(behandlingID: number) {
  return doThenDispatch(() => Api.Kodeverk.hentFolketrygdenKodeverk(behandlingID), {
    OK: Types.OK,
    FEILET: Types.FEILET,
    PENDING: Types.PENDING,
  });
}
