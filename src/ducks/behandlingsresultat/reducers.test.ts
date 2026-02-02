import { describe, it, expect } from "vitest";
import reducer, { initialState } from "./reducers";
import * as Types from "./types";
import { STATUS } from "../../services";

describe("behandlingsresultat reducer", () => {
  it("returnerer initial state", () => {
    expect(reducer(undefined, {})).toEqual(initialState);
  });

  it("setter PENDING", () => {
    expect(reducer(initialState, { type: Types.PENDING }).status).toBe(STATUS.PENDING);
  });

  it("setter ERROR ved FEILET", () => {
    const next = reducer(initialState, { type: Types.FEILET, data: { error: true } });
    expect(next.status).toBe(STATUS.ERROR);
    expect(next.data).toEqual({ error: true });
  });

  it("setter OK med data", () => {
    const data = { vedtakstype: "INNVILGELSE" };
    const next = reducer(initialState, { type: Types.OK, data });
    expect(next.status).toBe(STATUS.OK);
    expect(next.data).toEqual(data);
  });

  it("RESET tilbakestiller til initial state", () => {
    const modified = { status: STATUS.OK, data: { vedtakstype: "AVSLAG" } };
    expect(reducer(modified, { type: Types.RESET })).toEqual(initialState);
  });
});
