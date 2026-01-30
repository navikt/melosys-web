import { describe, it, expect } from "vitest";
import * as selectors from "./selectors";
import * as DucksTestUtils from "../test-utils";
import { STATUS } from "../../services/utils";

describe("folketrygdenkodeverk selectors", () => {
  it("FolketrygdenkodeverkDataSelector returnerer data eller tom objekt", () => {
    const state = DucksTestUtils.lagState({
      folketrygdenkodeverk: { status: STATUS.OK, data: null },
    });
    expect(selectors.FolketrygdenkodeverkDataSelector(state)).toEqual({});
  });

  it("FolketrygdenkodeverkDataSelector returnerer data", () => {
    const state = DucksTestUtils.lagState({
      folketrygdenkodeverk: { status: STATUS.OK, data: { begrunnelser: { K1: "Begrunnelse" } } },
    });
    expect(selectors.FolketrygdenkodeverkDataSelector(state)).toEqual({ begrunnelser: { K1: "Begrunnelse" } });
  });

  it("BegrunnelserSelector returnerer begrunnelser eller tom objekt", () => {
    const state = DucksTestUtils.lagState({
      folketrygdenkodeverk: { status: STATUS.OK, data: {} },
    });
    expect(selectors.BegrunnelserSelector(state)).toEqual({});
  });

  it("BegrunnelserSelector returnerer begrunnelser", () => {
    const state = DucksTestUtils.lagState({
      folketrygdenkodeverk: { status: STATUS.OK, data: { begrunnelser: { K1: "B1" } } },
    });
    expect(selectors.BegrunnelserSelector(state)).toEqual({ K1: "B1" });
  });
});
