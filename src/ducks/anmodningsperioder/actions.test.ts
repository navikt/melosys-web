import { describe, it, expect } from "vitest";
import { oppdaterAnmodningsperioder, resetAnmodningsperioderState } from "./actions";
import * as Types from "./types";

describe("anmodningsperioder actions", () => {
  it("resetAnmodningsperioderState returnerer RESET action", () => {
    expect(resetAnmodningsperioderState()).toEqual({ type: Types.RESET });
  });

  it("oppdaterAnmodningsperioder returnerer OPPDATER_ANMODNINGSPERIODER action", () => {
    const perioder = [{ id: 1 }] as any;
    expect(oppdaterAnmodningsperioder(perioder)).toEqual({
      type: Types.OPPDATER_ANMODNINGSPERIODER,
      anmodningsperioder: perioder,
    });
  });
});
