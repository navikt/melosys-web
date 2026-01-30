import { describe, it, expect } from "vitest";
import * as selectors from "./selectors";
import * as DucksTestUtils from "../test-utils";
import { STATUS } from "../../services";

describe("vedtak selectors", () => {
  it("ErPendingSelector returnerer true når status er PENDING", () => {
    const state = DucksTestUtils.lagState({
      vedtak: { status: STATUS.PENDING, data: {} },
    });
    expect(selectors.ErPendingSelector(state)).toBe(true);
  });

  it("ErPendingSelector returnerer false når status er OK", () => {
    const state = DucksTestUtils.lagState({
      vedtak: { status: STATUS.OK, data: {} },
    });
    expect(selectors.ErPendingSelector(state)).toBe(false);
  });
});
