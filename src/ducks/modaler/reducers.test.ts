import { describe, it, expect } from "vitest";
import reducer from "./reducers";
import * as Types from "./types";
import { STATUS } from "../../services";

describe("modaler reducer", () => {
  it("returnerer default state for ukjent action", () => {
    const state = reducer(undefined, {});
    expect(state.data.avslagSoknad).toBeDefined();
    expect(state.data.henlegg).toBeDefined();
    expect(state.data.oppfrisk).toBeDefined();
    expect(state.data.bekreftValg).toBeDefined();
  });

  it("oppdaterer avslagSoknad", () => {
    const state = reducer(undefined, {
      type: Types.OPPDATER_AVSLAG_SOKNAD,
      data: { synlig: true },
    });
    expect(state.data.avslagSoknad.synlig).toBe(true);
    expect(state.status).toBe(STATUS.OK);
  });

  it("oppdaterer bekreftValg", () => {
    const state = reducer(undefined, {
      type: Types.OPPDATER_BEKREFT_VALG,
      data: { synlig: true, type: "HENLEGG" },
    });
    expect(state.data.bekreftValg.synlig).toBe(true);
    expect(state.data.bekreftValg.type).toBe("HENLEGG");
  });

  it("oppdaterer henlegg", () => {
    const state = reducer(undefined, {
      type: Types.OPPDATER_HENLEGG,
      data: { synlig: true },
    });
    expect(state.data.henlegg.synlig).toBe(true);
  });

  it("oppdaterer oppfrisk", () => {
    const state = reducer(undefined, {
      type: Types.OPPDATER_OPPFRISK,
      data: { synlig: true, behandlingUnderOppfriskning: "123" },
    });
    expect(state.data.oppfrisk.synlig).toBe(true);
    expect(state.data.oppfrisk.behandlingUnderOppfriskning).toBe("123");
  });
});
