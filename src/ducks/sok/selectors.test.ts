import { describe, it, expect } from "vitest";
import * as selectors from "./selectors";
import * as DucksTestUtils from "../test-utils";
import { STATUS } from "../../services";

describe("sok selectors", () => {
  it("FagsakSokSelector returnerer fagsakListe", () => {
    const state = DucksTestUtils.lagState({
      sok: { status: STATUS.OK, data: { fagsakListe: [{ id: 1 }] } },
    });
    expect(selectors.FagsakSokSelector(state)).toEqual([{ id: 1 }]);
  });

  it("FagsakSokSelector returnerer tom liste når fagsakListe mangler", () => {
    const state = DucksTestUtils.lagState({
      sok: { status: STATUS.OK, data: {} },
    });
    expect(selectors.FagsakSokSelector(state)).toEqual([]);
  });

  it("SokPendingSelector returnerer true ved PENDING", () => {
    const state = DucksTestUtils.lagState({
      sok: { status: STATUS.PENDING, data: [] },
    });
    expect(selectors.SokPendingSelector(state)).toBe(true);
  });

  it("SokPendingSelector returnerer false ved OK", () => {
    const state = DucksTestUtils.lagState({
      sok: { status: STATUS.OK, data: [] },
    });
    expect(selectors.SokPendingSelector(state)).toBe(false);
  });
});
