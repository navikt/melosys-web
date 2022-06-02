import { doThenDispatch } from "../../services/utils";
import * as Types from "./types";
import * as Api from "../../services/api";

export function kontroller(data: Api.Kontroll.FerdigbehandlingKontrollData) {
  return doThenDispatch(() => Api.Kontroll.kontrollerFerdigbehandling(data), {
    OK: Types.OK,
    FEILET: Types.FEILET,
    PENDING: Types.FEILET,
  });
}
