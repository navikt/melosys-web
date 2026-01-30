import { describe, it, expect } from "vitest";
import * as selectors from "./selectors";
import * as DucksTestUtils from "../test-utils";
import { STATUS } from "../../services";

describe("featuretoggle selectors", () => {
  it("returnerer featureToggle state", () => {
    const state = DucksTestUtils.lagState({
      featureToggle: { status: STATUS.OK, data: { myFeature: true } },
    });
    expect(selectors.FeatureToggleSelector(state)).toEqual({
      status: STATUS.OK,
      data: { myFeature: true },
    });
  });

  it("returnerer undefined når featureToggle mangler", () => {
    const state = DucksTestUtils.lagState({});
    // lagState setter default featureToggle
    const result = selectors.FeatureToggleSelector(state);
    expect(result).toBeDefined();
  });
});
