import { describe, it, expect } from "vitest";
import * as selectors from "./selectors";
import * as DucksTestUtils from "../test-utils";
import { STATUS } from "../../services/utils";

describe("behandlingsperioder selectors", () => {
  it("behandlingsPerioderSelector returnerer data eller tom objekt", () => {
    const state = DucksTestUtils.lagState({
      behandlingsperioder: { status: STATUS.OK, data: null },
    });
    expect(selectors.behandlingsPerioderSelector(state)).toEqual({});
  });

  it("behandlingsPerioderSelector returnerer data", () => {
    const state = DucksTestUtils.lagState({
      behandlingsperioder: { status: STATUS.OK, data: { foo: "bar" } },
    });
    expect(selectors.behandlingsPerioderSelector(state)).toEqual({ foo: "bar" });
  });

  it("tidligereMedlemskap returnerer liste eller tom liste", () => {
    const state = DucksTestUtils.lagState({
      behandlingsperioder: { status: STATUS.OK, data: { tidligere_medlemsperiode_ids: [1, 2] } },
    });
    expect(selectors.tidligereMedlemskap(state)).toEqual([1, 2]);
  });

  it("tidligereMedlemskap returnerer tom liste når mangler", () => {
    const state = DucksTestUtils.lagState({
      behandlingsperioder: { status: STATUS.OK, data: {} },
    });
    expect(selectors.tidligereMedlemskap(state)).toEqual([]);
  });
});
