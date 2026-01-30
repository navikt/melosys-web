import { describe, it, expect } from "vitest";
import * as selectors from "./selectors";
import * as DucksTestUtils from "../test-utils";
import { STATUS } from "../../services/utils";

const lagModalState = (overrides = {}) =>
  DucksTestUtils.lagState({
    modaler: {
      status: STATUS.OK,
      data: {
        avslagSoknad: { synlig: false },
        bekreftValg: { synlig: false, type: "" },
        henlegg: { synlig: false },
        oppfrisk: { synlig: false, behandlingUnderOppfriskning: null, inkluderSiste5aar: false },
        ...overrides,
      },
    },
  });

describe("modaler selectors", () => {
  it("ErAvslagSoknadSynligSelector returnerer synlig", () => {
    const state = lagModalState({ avslagSoknad: { synlig: true } });
    expect(selectors.ErAvslagSoknadSynligSelector(state)).toBe(true);
  });

  it("ErBekreftValgSynligSelector returnerer synlig", () => {
    const state = lagModalState({ bekreftValg: { synlig: true, type: "TEST" } });
    expect(selectors.ErBekreftValgSynligSelector(state)).toBe(true);
  });

  it("BekreftValgTypeSelector returnerer type", () => {
    const state = lagModalState({ bekreftValg: { synlig: true, type: "HENLEGG" } });
    expect(selectors.BekreftValgTypeSelector(state)).toBe("HENLEGG");
  });

  it("ErHenleggSynligSelector returnerer synlig", () => {
    const state = lagModalState({ henlegg: { synlig: true } });
    expect(selectors.ErHenleggSynligSelector(state)).toBe(true);
  });

  it("ErOppfriskSynligSelector returnerer synlig", () => {
    const state = lagModalState({
      oppfrisk: { synlig: true, behandlingUnderOppfriskning: null, inkluderSiste5aar: false },
    });
    expect(selectors.ErOppfriskSynligSelector(state)).toBe(true);
  });

  it("BehandlingUnderOppfriskningSelector returnerer verdi", () => {
    const state = lagModalState({
      oppfrisk: { synlig: false, behandlingUnderOppfriskning: "abc123", inkluderSiste5aar: false },
    });
    expect(selectors.BehandlingUnderOppfriskningSelector(state)).toBe("abc123");
  });
});
