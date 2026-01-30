import { describe, it, expect } from "vitest";
import reducer from "./reducers";
import * as Types from "./types";
import { STATUS } from "../../services/utils";

describe("behandlingsstatus reducer", () => {
  it("returnerer initial state", () => {
    const state = reducer(undefined, {} as any);
    expect(state.status).toBe(STATUS.NOT_STARTED);
    expect(state.data).toEqual([]);
  });

  it("setter PENDING", () => {
    expect(reducer(undefined, { type: Types.PENDING } as any).status).toBe(STATUS.PENDING);
  });

  it("setter ERROR ved FEILET", () => {
    const next = reducer(undefined, { type: Types.FEILET, data: "feil" } as any);
    expect(next.status).toBe(STATUS.ERROR);
    expect(next.data).toBe("feil");
  });

  it("setter OK med data", () => {
    const data = { status: "UNDER_BEHANDLING" };
    const next = reducer(undefined, { type: Types.OK, data } as any);
    expect(next.status).toBe(STATUS.OK);
    expect(next.data).toEqual(data);
  });

  it("HENT_MULIGE_BEHANDLINGSSTATUSER setter muligeBehandlingsstatuser", () => {
    const statuser = [{ kode: "A" }, { kode: "B" }];
    const next = reducer(undefined, { type: Types.HENT_MULIGE_BEHANDLINGSSTATUSER, data: statuser } as any);
    expect(next.data).toEqual({ muligeBehandlingsstatuser: statuser });
  });

  it("HENT_MULIGE_BEHANDLINGSSTATUSER med null data returnerer uendret state", () => {
    const state = { status: STATUS.OK, data: { foo: "bar" } };
    const next = reducer(state as any, { type: Types.HENT_MULIGE_BEHANDLINGSSTATUSER, data: null } as any);
    expect(next.data).toEqual({ foo: "bar" });
  });
});
