import * as Types from "./types";
import { Data } from "./types";

export function resetKontrollFeil() {
  return { type: Types.RESET };
}

export function oppdaterKontrollFeil(feilData: Data) {
  return { type: Types.OPPDATER_KONTROLLFEIL, data: feilData };
}
