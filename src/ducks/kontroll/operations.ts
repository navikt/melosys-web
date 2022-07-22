import { doThenDispatch } from "../../services/utils";
import * as Types from "./types";
import * as Api from "../../services/api";

export function kontrollerFerdigbehandling(data: Api.Kontroll.FerdigbehandlingKontrollData) {
  return doThenDispatch(() => Api.Kontroll.kontrollerFerdigbehandling(data), {
    OK: Types.OK,
    FEILET: Types.FEILET,
    PENDING: Types.FEILET,
  });
}

export function kontrollerPeriode(behandlingID: number, data: Api.Kontroll.PeriodeKontrollData) {
  return doThenDispatch(() => Api.Kontroll.kontrollerPeriode(behandlingID, data), {
    OK: Types.OK,
    FEILET: Types.FEILET,
    PENDING: Types.FEILET,
  });
}
