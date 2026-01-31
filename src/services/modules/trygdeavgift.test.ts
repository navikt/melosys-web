import { describe, it, expect, vi } from "vitest";
import {
  hentTrygdeavgiftMottaker,
  hentTrygdeavgiftperioder,
  beregnTrygdeavgiftsperioder,
  eøsPensjonistBeregnTrygdeavgiftsperioder,
  hentBeregnetTrygdeavgift,
  hentBeregnetTrygdeavgiftEosPensjonist,
  hentOpprinneligTrygdeavgiftsgrunnlag,
  hentFakturamottaker,
  slettTrygdeavgiftsperioder,
} from "./trygdeavgift";

vi.mock("../utils", () => ({
  getAsJson: vi.fn().mockResolvedValue({}),
  putAsJson: vi.fn().mockResolvedValue({}),
  deleteAsJson: vi.fn().mockResolvedValue(null),
}));

const testGrunnlag = { skatteforholdsperioder: [], inntektskilder: [] };

describe("trygdeavgift", () => {
  it("hentTrygdeavgiftMottaker returnerer promise", () => {
    expect(hentTrygdeavgiftMottaker(1)).toBeInstanceOf(Promise);
  });

  it("hentTrygdeavgiftperioder returnerer promise", () => {
    expect(hentTrygdeavgiftperioder(1)).toBeInstanceOf(Promise);
  });

  it("beregnTrygdeavgiftsperioder returnerer promise", () => {
    expect(beregnTrygdeavgiftsperioder(1, testGrunnlag)).toBeInstanceOf(Promise);
  });

  it("eøsPensjonistBeregnTrygdeavgiftsperioder returnerer promise", () => {
    expect(eøsPensjonistBeregnTrygdeavgiftsperioder(1, testGrunnlag)).toBeInstanceOf(Promise);
  });

  it("hentBeregnetTrygdeavgift returnerer promise", () => {
    expect(hentBeregnetTrygdeavgift(1)).toBeInstanceOf(Promise);
  });

  it("hentBeregnetTrygdeavgiftEosPensjonist returnerer promise", () => {
    expect(hentBeregnetTrygdeavgiftEosPensjonist(1)).toBeInstanceOf(Promise);
  });

  it("hentOpprinneligTrygdeavgiftsgrunnlag returnerer promise", () => {
    expect(hentOpprinneligTrygdeavgiftsgrunnlag(1)).toBeInstanceOf(Promise);
  });

  it("hentFakturamottaker returnerer promise", () => {
    expect(hentFakturamottaker(1)).toBeInstanceOf(Promise);
  });

  it("slettTrygdeavgiftsperioder returnerer promise", () => {
    expect(slettTrygdeavgiftsperioder(1)).toBeInstanceOf(Promise);
  });
});
