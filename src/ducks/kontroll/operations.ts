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

export function kontrollerGodkjennUnntaksperiode(data: Api.Kontroll.GodkjennUnntaksperiodeKontrollData) {
  return doThenDispatch(() => Api.Kontroll.kontrollerGodkjennUnntaksperiode(data), {
    OK: Types.OK,
    FEILET: Types.FEILET,
    PENDING: Types.FEILET,
  });
}
