import { describe, it, expect } from "vitest";
import reducer from "./reducers";
import * as Types from "./types";
import { STATUS } from "../../services";

describe("menypanel reducer", () => {
  it("returnerer default state", () => {
    const state = reducer(undefined, {});
    expect(state.data.synlig).toBe(false);
  });

  it("oppdaterer synlig via OPPDATER_VIS_MENYPANEL", () => {
    const state = reducer(undefined, {
      type: Types.OPPDATER_VIS_MENYPANEL,
      data: { synlig: true },
    });
    expect(state.data.synlig).toBe(true);
    expect(state.status).toBe(STATUS.OK);
  });

  it("oppdaterer fullmektig-endret via OPPDATER_ER_FULLMEKTIG_ENDRET", () => {
    const state = reducer(undefined, {
      type: Types.OPPDATER_ER_FULLMEKTIG_ENDRET,
      data: { fullmektig: { erFullmektigEndret: true } },
    });
    expect(state.data.fullmektig.erFullmektigEndret).toBe(true);
    expect(state.status).toBe(STATUS.OK);
  });
});
