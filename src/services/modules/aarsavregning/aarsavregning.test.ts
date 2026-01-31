import { describe, it, expect, vi } from "vitest";
import {
  hentAarsavregning,
  lagAarsavregning,
  oppdaterHarTrygdeavgiftFraAvgiftssystemet,
  oppdaterHarSkjoennsfastsattInntekt,
  oppdaterEndeligAvgiftValg,
  hentFiltrertAarsavregningList,
  oppdaterBeregnetAvgiftBeloep,
  oppdaterManueltAvgiftBeloep,
  oppdaterAarsavregning,
} from "./aarsavregning";

vi.mock("../../utils", () => ({
  getAsJson: vi.fn().mockResolvedValue({}),
  postAsJson: vi.fn().mockResolvedValue({}),
  putAsJson: vi.fn().mockResolvedValue({}),
}));

describe("aarsavregning", () => {
  it("hentAarsavregning returnerer promise", () => {
    expect(hentAarsavregning(1)).toBeInstanceOf(Promise);
  });

  it("lagAarsavregning returnerer promise", () => {
    expect(lagAarsavregning(1, { aar: 2024 })).toBeInstanceOf(Promise);
  });

  it("oppdaterHarTrygdeavgiftFraAvgiftssystemet returnerer promise", () => {
    expect(oppdaterHarTrygdeavgiftFraAvgiftssystemet(1, { harTrygdeavgiftFraAvgiftssystemet: true })).toBeInstanceOf(
      Promise,
    );
  });

  it("oppdaterHarSkjoennsfastsattInntekt returnerer promise", () => {
    expect(oppdaterHarSkjoennsfastsattInntekt(1, true)).toBeInstanceOf(Promise);
  });

  it("oppdaterEndeligAvgiftValg returnerer promise", () => {
    expect(oppdaterEndeligAvgiftValg(1, "BEREGNET", 2)).toBeInstanceOf(Promise);
  });

  it("hentFiltrertAarsavregningList returnerer promise", () => {
    expect(hentFiltrertAarsavregningList("123")).toBeInstanceOf(Promise);
  });

  it("hentFiltrertAarsavregningList med filtre returnerer promise", () => {
    expect(hentFiltrertAarsavregningList("123", "INNVILGET", 2024)).toBeInstanceOf(Promise);
  });

  it("oppdaterBeregnetAvgiftBeloep returnerer promise", () => {
    expect(oppdaterBeregnetAvgiftBeloep(1, 2, 1000)).toBeInstanceOf(Promise);
  });

  it("oppdaterManueltAvgiftBeloep returnerer promise", () => {
    expect(oppdaterManueltAvgiftBeloep(1, 2, 500)).toBeInstanceOf(Promise);
  });

  it("oppdaterAarsavregning returnerer promise", () => {
    expect(oppdaterAarsavregning(1, { avregning: {} }, 2)).toBeInstanceOf(Promise);
  });
});
