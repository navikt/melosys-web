import * as Types from "./types";

export function resetKontrollFeil() {
  return { type: Types.RESET };
}

export function oppdaterKontrollFeil(feilData: any) {
  return { type: Types.OK, data: feilData };
}
