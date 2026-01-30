import { describe, it, expect } from "vitest";
import * as selectors from "./selectors";
import * as DucksTestUtils from "../test-utils";
import { STATUS } from "../../services/utils";

const lagState = (data: any[] | null = []) =>
  DucksTestUtils.lagState({
    anmodningsperioder: { status: STATUS.OK, data },
  });

describe("anmodningsperioder selectors", () => {
  it("AnmodningsperioderSelector returnerer data eller tom liste", () => {
    expect(selectors.AnmodningsperioderSelector(lagState(null))).toEqual([]);
    expect(selectors.AnmodningsperioderSelector(lagState([{ id: 1 }]))).toEqual([{ id: 1 }]);
  });

  it("AnmodningsperiodeSelector returnerer første element", () => {
    const state = lagState([{ id: 1, lovvalgBestemmelse: "ART12" }]);
    expect(selectors.AnmodningsperiodeSelector(state)).toEqual({ id: 1, lovvalgBestemmelse: "ART12" });
  });

  it("AnmodningsperiodeSelector returnerer tom objekt når liste er tom", () => {
    expect(selectors.AnmodningsperiodeSelector(lagState([]))).toEqual({});
  });

  it("AnmodningsperiodeIDSelector returnerer id", () => {
    const state = lagState([{ id: 42 }]);
    expect(selectors.AnmodningsperiodeIDSelector(state)).toBe(42);
  });

  it("LovvalgsbestemmelseSelector returnerer lovvalgBestemmelse", () => {
    const state = lagState([{ lovvalgBestemmelse: "ART12_1" }]);
    expect(selectors.LovvalgsbestemmelseSelector(state)).toBe("ART12_1");
  });

  it("FomDatoSelector og TomDatoSelector returnerer datoer", () => {
    const state = lagState([{ fomDato: "2024-01-01", tomDato: "2024-12-31" }]);
    expect(selectors.FomDatoSelector(state)).toBe("2024-01-01");
    expect(selectors.TomDatoSelector(state)).toBe("2024-12-31");
  });

  it("AlleAnmodningsperioderSendtUtlandSelector returnerer true når alle er sendt", () => {
    const state = lagState([{ sendtUtland: true }, { sendtUtland: true }]);
    expect(selectors.AlleAnmodningsperioderSendtUtlandSelector(state)).toBe(true);
  });

  it("AlleAnmodningsperioderSendtUtlandSelector returnerer false når ikke alle er sendt", () => {
    const state = lagState([{ sendtUtland: true }, { sendtUtland: false }]);
    expect(selectors.AlleAnmodningsperioderSendtUtlandSelector(state)).toBe(false);
  });

  it("AlleAnmodningsperioderSendtUtlandSelector returnerer false for tom liste", () => {
    expect(selectors.AlleAnmodningsperioderSendtUtlandSelector(lagState([]))).toBe(false);
  });

  it("AnmodningsperioderErSendtUtlandetSelector returnerer true når noen er sendt", () => {
    const state = lagState([{ sendtUtland: false }, { sendtUtland: true }]);
    expect(selectors.AnmodningsperioderErSendtUtlandetSelector(state)).toBe(true);
  });
});
