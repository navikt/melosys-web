import { describe, it, expect } from "vitest";
import {
  resetKontrollFeil,
  oppdaterKontrollFeil,
  kontrollerFerdigbehandling,
  kontrollerAnmodningOmUnntak,
  kontrollerUnntaksperiode,
} from "./operations";
import * as Types from "./types";

describe("kontroll operations", () => {
  it("resetKontrollFeil returnerer RESET action", () => {
    expect(resetKontrollFeil()).toEqual({ type: Types.RESET });
  });

  it("oppdaterKontrollFeil returnerer OPPDATER_KONTROLLFEIL action", () => {
    const data = { feil: [{ type: "FEIL", melding: "test" }] } as any;
    expect(oppdaterKontrollFeil(data)).toEqual({ type: Types.OPPDATER_KONTROLLFEIL, data });
  });

  it("kontrollerFerdigbehandling returnerer thunk", () => {
    expect(typeof kontrollerFerdigbehandling({} as any)).toBe("function");
  });

  it("kontrollerAnmodningOmUnntak returnerer thunk", () => {
    expect(typeof kontrollerAnmodningOmUnntak({} as any)).toBe("function");
  });

  it("kontrollerUnntaksperiode returnerer thunk", () => {
    expect(typeof kontrollerUnntaksperiode(1, {} as any)).toBe("function");
  });
});
