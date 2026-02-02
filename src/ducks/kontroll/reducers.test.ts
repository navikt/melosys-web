import { describe, it, expect } from "vitest";
import reducer from "./reducers";
import * as Types from "./types";
import { STATUS } from "../../services";

describe("kontroll reducer", () => {
  const initialState = { status: STATUS.NOT_STARTED, data: {} };

  it("returnerer initial state", () => {
    expect(reducer(undefined, { type: "UNKNOWN" } as any)).toEqual(initialState);
  });

  it("setter PENDING", () => {
    const next = reducer(initialState, { type: Types.PENDING } as any);
    expect(next.status).toBe(STATUS.PENDING);
  });

  it("setter ERROR ved FEILET", () => {
    const next = reducer(initialState, { type: Types.FEILET, data: { error: "feil" } } as any);
    expect(next.status).toBe(STATUS.ERROR);
    expect(next.data).toEqual({ error: "feil" });
  });

  it("setter OK med data", () => {
    const data = { kontrollfeilList: [] };
    const next = reducer(initialState, { type: Types.OK, data } as any);
    expect(next.status).toBe(STATUS.OK);
    expect(next.data).toEqual(data);
  });

  it("oppdaterer kontrollfeil", () => {
    const data = { kontrollfeilList: [{ kode: "K1", felter: ["f1"] }] };
    const next = reducer(initialState, { type: Types.OPPDATER_KONTROLLFEIL, data } as any);
    expect(next.data).toEqual(data);
  });

  it("reset til initial state", () => {
    const modified = { status: STATUS.OK, data: { kontrollfeilList: [] } };
    const next = reducer(modified, { type: Types.RESET } as any);
    expect(next).toEqual(initialState);
  });
});
