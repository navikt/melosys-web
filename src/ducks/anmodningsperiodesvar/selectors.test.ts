import { describe, it, expect } from "vitest";
import * as selectors from "./selectors";
import * as DucksTestUtils from "../test-utils";
import { STATUS } from "../../services";

const lagState = (data: any = {}) =>
  DucksTestUtils.lagState({
    anmodningsperiodesvar: { status: STATUS.OK, data },
  });

describe("anmodningsperiodesvar selectors", () => {
  it("AnmodningsperiodesvarSelector returnerer data eller tom objekt", () => {
    expect(selectors.AnmodningsperiodesvarSelector(lagState(null))).toEqual({});
    expect(selectors.AnmodningsperiodesvarSelector(lagState({ test: true }))).toEqual({ test: true });
  });

  it("ReduxStatusSelector returnerer status", () => {
    const state = DucksTestUtils.lagState({
      anmodningsperiodesvar: { status: STATUS.PENDING, data: {} },
    });
    expect(selectors.ReduxStatusSelector(state)).toBe(STATUS.PENDING);
  });

  it("EndretPeriodeFomSelector og EndretPeriodeTomSelector", () => {
    const state = lagState({ endretPeriode: { fom: "2024-01-01", tom: "2024-12-31" } });
    expect(selectors.EndretPeriodeFomSelector(state)).toBe("2024-01-01");
    expect(selectors.EndretPeriodeTomSelector(state)).toBe("2024-12-31");
  });

  it("BegrunnelseFritekstSelector returnerer fritekst eller tom streng", () => {
    expect(selectors.BegrunnelseFritekstSelector(lagState({}))).toBe("");
    expect(selectors.BegrunnelseFritekstSelector(lagState({ begrunnelseFritekst: "Tekst" }))).toBe("Tekst");
  });

  it("AnmodningsperiodeSvarTypeSelector returnerer svartype", () => {
    const state = lagState({ anmodningsperiodeSvarType: "INNVILGET" });
    expect(selectors.AnmodningsperiodeSvarTypeSelector(state)).toBe("INNVILGET");
  });
});
