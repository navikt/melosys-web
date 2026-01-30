import { describe, it, expect } from "vitest";
import * as selectors from "./selectors";
import * as DucksTestUtils from "../test-utils";
import { STATUS } from "../../services/utils";

describe("menypanel selectors", () => {
  it("MenypanelSynligSelector returnerer synlig", () => {
    const state = DucksTestUtils.lagState({
      menypanel: { status: STATUS.OK, data: { synlig: true } },
    });
    expect(selectors.MenypanelSynligSelector(state)).toBe(true);
  });

  it("MenypanelErFullmektigEndretSelector returnerer erFullmektigEndret", () => {
    const state = DucksTestUtils.lagState({
      menypanel: {
        status: STATUS.OK,
        data: { synlig: false, fullmektig: { erFullmektigEndret: true } },
      },
    });
    expect(selectors.MenypanelErFullmektigEndretSelector(state)).toBe(true);
  });

  it("MenypanelErFullmektigEndretSelector returnerer undefined når mangler", () => {
    const state = DucksTestUtils.lagState({
      menypanel: { status: STATUS.OK, data: { synlig: false } },
    });
    expect(selectors.MenypanelErFullmektigEndretSelector(state)).toBeUndefined();
  });
});
