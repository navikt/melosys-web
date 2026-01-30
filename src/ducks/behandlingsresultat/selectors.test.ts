import { describe, it, expect } from "vitest";
import * as selectors from "./selectors";
import * as DucksTestUtils from "../test-utils";
import { STATUS } from "../../services/utils";

const lagState = (data = {}) =>
  DucksTestUtils.lagState({
    behandlingsresultat: { status: STATUS.OK, data },
  });

describe("behandlingsresultat selectors", () => {
  it("BehandlingsresultatSelector returnerer data", () => {
    const state = lagState({ vedtakstype: "INNVILGELSE" });
    expect(selectors.BehandlingsresultatSelector(state)).toEqual({ vedtakstype: "INNVILGELSE" });
  });

  it("BehandlingsresultatSelector returnerer tom objekt når data er null", () => {
    const state = DucksTestUtils.lagState({
      behandlingsresultat: { status: STATUS.OK, data: null },
    });
    expect(selectors.BehandlingsresultatSelector(state)).toEqual({});
  });

  it("BehandlingsresultatStatusErOkSelector returnerer true når OK", () => {
    const state = lagState();
    expect(selectors.BehandlingsresultatStatusErOkSelector(state)).toBe(true);
  });

  it("BehandlingsresultatStatusErOkSelector returnerer false når PENDING", () => {
    const state = DucksTestUtils.lagState({
      behandlingsresultat: { status: STATUS.PENDING, data: {} },
    });
    expect(selectors.BehandlingsresultatStatusErOkSelector(state)).toBe(false);
  });

  it("VedtakstypeSelector returnerer vedtakstype", () => {
    const state = lagState({ vedtakstype: "AVSLAG" });
    expect(selectors.VedtakstypeSelector(state)).toBe("AVSLAG");
  });

  it("BegrunnelseKoderSelector returnerer begrunnelseKoder", () => {
    const state = lagState({ begrunnelseKoder: ["K1", "K2"] });
    expect(selectors.BegrunnelseKoderSelector(state)).toEqual(["K1", "K2"]);
  });

  it("ÅrsavregningIDSelector returnerer aarsavregningID", () => {
    const state = lagState({ aarsavregningID: "123" });
    expect(selectors.ÅrsavregningIDSelector(state)).toBe("123");
  });

  it("fakturaserieReferanseSelector returnerer fakturaserieReferanse", () => {
    const state = lagState({ fakturaserieReferanse: "REF-1" });
    expect(selectors.fakturaserieReferanseSelector(state)).toBe("REF-1");
  });
});
