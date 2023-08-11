import * as Types from "./types";

export function resetKontroll() {
  return { type: Types.RESET };
}

export function kontrollFeil(feilData: any) {
  return { type: Types.OK, data: feilData };
}
