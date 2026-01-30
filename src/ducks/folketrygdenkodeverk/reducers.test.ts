import { describe, it, expect } from "vitest";
import reducer, { initialState } from "./reducers";
import * as Types from "./types";
import { STATUS } from "../../services/utils";

describe("folketrygdenkodeverk reducer", () => {
  it("returnerer initial state", () => {
    expect(reducer(undefined, {} as any)).toEqual(initialState);
  });

  it("setter PENDING", () => {
    expect(reducer(initialState, { type: Types.PENDING } as any).status).toBe(STATUS.PENDING);
  });

  it("setter ERROR ved FEILET", () => {
    const next = reducer(initialState, { type: Types.FEILET, data: "feil" } as any);
    expect(next.status).toBe(STATUS.ERROR);
  });

  it("setter OK med data", () => {
    const data = { begrunnelser: { key: [{ kode: "A" }] } };
    const next = reducer(initialState, { type: Types.OK, data } as any);
    expect(next.status).toBe(STATUS.OK);
    expect(next.data).toEqual(data);
  });
});
