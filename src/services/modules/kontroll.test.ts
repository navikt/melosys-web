import { describe, it, expect, vi } from "vitest";
import {
  kontrollerFerdigbehandling,
  kontrollerAnmodningOmUnntak,
  kontrollerAdresse,
  erBucAapen,
  kontrollerUnntaksperiode,
} from "./kontroll";

vi.mock("../utils", () => ({
  getAsJson: vi.fn().mockResolvedValue({}),
  postAsJson: vi.fn().mockResolvedValue({}),
}));

describe("kontroll", () => {
  it("kontrollerFerdigbehandling returnerer promise", () => {
    expect(
      kontrollerFerdigbehandling({ behandlingID: 1, vedtakstype: null, skalRegisteropplysningerOppdateres: false }),
    ).toBeInstanceOf(Promise);
  });

  it("kontrollerAnmodningOmUnntak returnerer promise", () => {
    expect(kontrollerAnmodningOmUnntak({ behandlingID: 1 })).toBeInstanceOf(Promise);
  });

  it("kontrollerAdresse returnerer promise", () => {
    expect(kontrollerAdresse({})).toBeInstanceOf(Promise);
  });

  it("erBucAapen returnerer promise", () => {
    expect(erBucAapen(1)).toBeInstanceOf(Promise);
  });

  it("kontrollerUnntaksperiode returnerer promise", () => {
    expect(kontrollerUnntaksperiode(1, { periodeFom: new Date(), periodeTom: new Date() })).toBeInstanceOf(Promise);
  });
});
