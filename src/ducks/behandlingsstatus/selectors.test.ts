import { describe, it, expect } from "vitest";
import * as selectors from "./selectors";
import * as DucksTestUtils from "../test-utils";
import { STATUS } from "../../services/utils";

describe("behandlingsstatus selectors", () => {
  it("BehandlingsstatusDataSelector returnerer data", () => {
    const state = DucksTestUtils.lagState({
      behandlingsstatus: {
        status: STATUS.OK,
        data: { muligeBehandlingsstatuser: ["UNDER_BEHANDLING"] },
      },
    });
    expect(selectors.BehandlingsstatusDataSelector(state)).toEqual({
      muligeBehandlingsstatuser: ["UNDER_BEHANDLING"],
    });
  });

  it("MuligeBehandlingsstatusSelector returnerer liste", () => {
    const state = DucksTestUtils.lagState({
      behandlingsstatus: {
        status: STATUS.OK,
        data: { muligeBehandlingsstatuser: ["S1", "S2"] },
      },
    });
    expect(selectors.MuligeBehandlingsstatusSelector(state)).toEqual(["S1", "S2"]);
  });

  it("MuligeBehandlingsstatusSelector returnerer tom liste når mangler", () => {
    const state = DucksTestUtils.lagState({
      behandlingsstatus: { status: STATUS.OK, data: {} },
    });
    expect(selectors.MuligeBehandlingsstatusSelector(state)).toEqual([]);
  });
});
