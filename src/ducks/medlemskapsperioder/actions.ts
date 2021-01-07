import * as Types from "./types";

export function oppdaterBestemmelse(bestemmelse: string): Types.OppdaterBestemmelseAction {
  return {
    type: Types.OPPDATER_BESTEMMELSE,
    data: bestemmelse,
  };
}
