import { describe, it, expect } from "vitest";
import reducer from "./reducers";
import * as Types from "./types";
import { STATUS } from "../../services";

describe("aarsavregning reducer", () => {
  it("returnerer initial state", () => {
    const state = reducer(undefined, {} as any);
    expect(state.status).toBe(STATUS.NOT_STARTED);
    expect(state.data).toEqual({});
  });

  it("setter OK med data", () => {
    const data = { id: 1, aar: 2024 };
    const next = reducer(undefined, { type: Types.OK, data } as any);
    expect(next.status).toBe(STATUS.OK);
    expect(next.data).toEqual(data);
  });

  it("RESET tilbakestiller", () => {
    const modified = { status: STATUS.OK, data: { id: 1 } };
    const next = reducer(modified as any, { type: Types.RESET } as any);
    expect(next.status).toBe(STATUS.NOT_STARTED);
    expect(next.data).toEqual({});
  });
});
