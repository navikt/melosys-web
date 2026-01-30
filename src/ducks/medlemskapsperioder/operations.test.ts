import { describe, it, expect } from "vitest";
import {
  hentMedlemskapsperioder,
  opprettMedlemskapsperiode,
  oppdaterMedlemskapsperiode,
  slettMedlemskapsperiode,
  slettMedlemskapsperioder,
  resetMedlemskapsperioder,
  opprettMedlemskapsperioderForslag,
} from "./operations";
import * as Types from "./types";

describe("medlemskapsperioder operations", () => {
  it("hentMedlemskapsperioder returnerer thunk", () => {
    expect(typeof hentMedlemskapsperioder(1)).toBe("function");
  });

  it("opprettMedlemskapsperiode returnerer thunk", () => {
    expect(typeof opprettMedlemskapsperiode(1, {} as any)).toBe("function");
  });

  it("oppdaterMedlemskapsperiode returnerer thunk", () => {
    expect(typeof oppdaterMedlemskapsperiode(1, 2, {} as any)).toBe("function");
  });

  it("slettMedlemskapsperiode returnerer thunk", () => {
    expect(typeof slettMedlemskapsperiode(1, 2)).toBe("function");
  });

  it("slettMedlemskapsperioder returnerer thunk", () => {
    expect(typeof slettMedlemskapsperioder(1)).toBe("function");
  });

  it("opprettMedlemskapsperioderForslag returnerer thunk", () => {
    expect(typeof opprettMedlemskapsperioderForslag(1, "bestemmelse")).toBe("function");
  });

  it("resetMedlemskapsperioder returnerer RESET action", () => {
    expect(resetMedlemskapsperioder()).toEqual({ type: Types.RESET });
  });
});
