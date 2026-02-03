import { describe, it, expect } from "vitest";
import reducer from "./reducers";
import * as Types from "./types";
import { STATUS } from "../../services";

describe("anmodningunntak reducer", () => {
  it("returnerer initial state", () => {
    const state = reducer(undefined, {} as any);
    expect(state.status).toBe(STATUS.NOT_STARTED);
    expect(state.data).toEqual({});
  });

  it("setter PENDING", () => {
    expect(reducer(undefined, { type: Types.PENDING } as any).status).toBe(STATUS.PENDING);
  });

  it("setter ERROR ved FEILET og merger data", () => {
    const state = { status: STATUS.OK, data: { existing: true } };
    const next = reducer(state as any, { type: Types.FEILET, data: { error: true } } as any);
    expect(next.status).toBe(STATUS.ERROR);
    expect(next.data).toEqual({ existing: true, error: true });
  });

  it("setter OK med data", () => {
    const data = { result: "success" };
    const next = reducer(undefined, { type: Types.OK, data } as any);
    expect(next.status).toBe(STATUS.OK);
    expect(next.data).toEqual(data);
  });

  it("RESET tilbakestiller", () => {
    const modified = { status: STATUS.OK, data: { result: "success" } };
    const next = reducer(modified as any, { type: Types.RESET } as any);
    expect(next.status).toBe(STATUS.NOT_STARTED);
    expect(next.data).toEqual({});
  });
});
