import { describe, it, expect } from "vitest";
import reducer from "./reducers";
import * as Types from "./types";
import { STATUS } from "../../services/utils";

describe("fakturaserier reducer", () => {
  it("returnerer initial state", () => {
    const state = reducer(undefined, {} as any);
    expect(state.status).toBe(STATUS.NOT_STARTED);
    expect(state.data).toEqual([]);
  });

  it("setter PENDING", () => {
    expect(reducer(undefined, { type: Types.PENDING } as any).status).toBe(STATUS.PENDING);
  });

  it("setter ERROR ved FEILET", () => {
    const next = reducer(undefined, { type: Types.FEILET, data: { data: "feil" } } as any);
    expect(next.status).toBe(STATUS.ERROR);
    expect(next.data).toBe("feil");
  });

  it("setter OK med data", () => {
    const data = [{ fakturaserieReferanse: "ref1" }];
    const next = reducer(undefined, { type: Types.OK, data } as any);
    expect(next.status).toBe(STATUS.OK);
    expect(next.data).toEqual(data);
  });

  it("RESET tilbakestiller", () => {
    const modified = { status: STATUS.OK, data: [{ fakturaserieReferanse: "ref1" }] };
    const next = reducer(modified as any, { type: Types.RESET } as any);
    expect(next.status).toBe(STATUS.NOT_STARTED);
    expect(next.data).toEqual([]);
  });
});
