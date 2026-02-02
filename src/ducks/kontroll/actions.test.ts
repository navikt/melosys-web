import { describe, it, expect } from "vitest";
import { resetKontrollFeil, oppdaterKontrollFeil } from "./actions";
import * as Types from "./types";

describe("kontroll actions", () => {
  it("resetKontrollFeil returnerer RESET action", () => {
    expect(resetKontrollFeil()).toEqual({ type: Types.RESET });
  });

  it("oppdaterKontrollFeil returnerer OPPDATER_KONTROLLFEIL action med data", () => {
    const feilData = [{ type: "FEIL", melding: "Noe gikk galt" }] as any;
    expect(oppdaterKontrollFeil(feilData)).toEqual({
      type: Types.OPPDATER_KONTROLLFEIL,
      data: feilData,
    });
  });
});
