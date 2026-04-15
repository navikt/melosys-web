import { describe, it, expect } from "vitest";
import reducer from "./reducers";
import * as Types from "./types";
import { STATUS } from "../../services";

describe("helseutgiftdekkesperiode reducer", () => {
  it("returnerer initial state", () => {
    const state = reducer(undefined, {} as any);
    expect(state.status).toBe(STATUS.NOT_STARTED);
    expect(state.data).toEqual([]);
  });

  it("setter PENDING", () => {
    expect(reducer(undefined, { type: Types.PENDING } as any).status).toBe(STATUS.PENDING);
  });

  it("setter OK med data", () => {
    const data = [{ id: 1, fomDato: "2024-01-01", tomDato: "2024-12-31" }];
    const next = reducer(undefined, { type: Types.OK, data } as any);
    expect(next.status).toBe(STATUS.OK);
    expect(next.data).toEqual(data);
  });

  it("setter ERROR ved FEILET", () => {
    const next = reducer(undefined, { type: Types.FEILET, data: "feil" } as any);
    expect(next.status).toBe(STATUS.ERROR);
  });
});
