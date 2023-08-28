import { doThenDispatch } from "../../services/utils";
import * as Types from "./types";
import * as Api from "../../services/api";
import * as Actions from "./actions";

export function resetKontrollFeil() {
  return Actions.resetKontrollFeil();
}

export function oppdaterKontrollFeil(feilData: any) {
  return Actions.oppdaterKontrollFeil(feilData);
}

export function kontrollerFerdigbehandling(data: Api.Kontroll.FerdigbehandlingKontrollData) {
  return doThenDispatch(() => Api.Kontroll.kontrollerFerdigbehandling(data), {
    OK: Types.OK,
    FEILET: Types.FEILET,
    PENDING: Types.FEILET,
  });
}

export function kontrollerUnntaksperiode(behandlingID: number, data: Api.Kontroll.PeriodeKontrollData) {
  return doThenDispatch(() => Api.Kontroll.kontrollerUnntaksperiode(behandlingID, data), {
    OK: Types.OK,
    FEILET: Types.FEILET,
    PENDING: Types.FEILET,
  });
}
