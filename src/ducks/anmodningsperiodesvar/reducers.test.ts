import { describe, it, expect } from "vitest";
import reducer, { initialState } from "./reducers";
import * as Types from "./types";
import { STATUS } from "../../services/utils";

describe("anmodningsperiodesvar reducer", () => {
  it("returnerer initial state", () => {
    expect(reducer(undefined, {})).toEqual(initialState);
  });

  it("setter PENDING", () => {
    expect(reducer(initialState, { type: Types.PENDING }).status).toBe(STATUS.PENDING);
  });

  it("setter OK med data", () => {
    const next = reducer(initialState, { type: Types.OK, data: { svarType: "INNVILGET" } });
    expect(next.status).toBe(STATUS.OK);
    expect(next.data).toEqual({ svarType: "INNVILGET" });
  });

  it("RESET tilbakestiller", () => {
    const modified = { status: STATUS.OK, data: { svarType: "INNVILGET" } };
    expect(reducer(modified, { type: Types.RESET })).toEqual(initialState);
  });

  it("OPPDATER_ANMODNINGSPERIODESVAR erstatter data", () => {
    const next = reducer(initialState, {
      type: Types.OPPDATER_ANMODNINGSPERIODESVAR,
      anmodningsperiodesvar: { begrunnelseFritekst: "Tekst" },
    });
    expect(next.data).toEqual({ begrunnelseFritekst: "Tekst" });
    expect(next.status).toBe(STATUS.OK);
  });
});
