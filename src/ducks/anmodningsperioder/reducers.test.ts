import { describe, it, expect } from "vitest";
import reducer, { initialState } from "./reducers";
import * as Types from "./types";
import { STATUS } from "../../services";

describe("anmodningsperioder reducer", () => {
  it("returnerer initial state", () => {
    expect(reducer(undefined, {})).toEqual(initialState);
  });

  it("setter PENDING", () => {
    expect(reducer(initialState, { type: Types.PENDING }).status).toBe(STATUS.PENDING);
  });

  it("setter ERROR ved FEILET", () => {
    const next = reducer(initialState, { type: Types.FEILET, data: "feil" });
    expect(next.status).toBe(STATUS.ERROR);
  });

  it("setter OK med anmodningsperioder fra data", () => {
    const next = reducer(initialState, {
      type: Types.OK,
      data: { anmodningsperioder: [{ id: 1 }] },
    });
    expect(next.status).toBe(STATUS.OK);
    expect(next.data).toEqual([{ id: 1 }]);
  });

  it("RESET tilbakestiller", () => {
    const modified = { status: STATUS.OK, data: [{ id: 1 }] } as any;
    expect(reducer(modified, { type: Types.RESET })).toEqual(initialState);
  });

  it("OPPDATER_ANMODNINGSPERIODER erstatter data", () => {
    const next = reducer(initialState, {
      type: Types.OPPDATER_ANMODNINGSPERIODER,
      anmodningsperioder: [{ id: 42 }],
    });
    expect(next.data).toEqual([{ id: 42 }]);
    expect(next.status).toBe(STATUS.OK);
  });
});
