import { describe, it, expect } from "vitest";
import reducer, { initialState } from "./reducers";
import * as Types from "./types";
import { STATUS } from "../../services/utils";

describe("medlemskapsperioder reducer", () => {
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

  it("OK_MEDLEMSKAPSPERIODE setter medlemskapsperioder", () => {
    const perioder = [{ id: 1 }, { id: 2 }];
    const next = reducer(initialState, { type: Types.OK_MEDLEMSKAPSPERIODE, data: perioder } as any);
    expect(next.status).toBe(STATUS.OK);
    expect(next.data.medlemskapsperioder).toEqual(perioder);
  });

  it("OK_OPPRETT_MEDLEMSKAPSPERIODE legger til periode", () => {
    const state = { ...initialState, data: { medlemskapsperioder: [{ id: 1 }] } };
    const next = reducer(state as any, { type: Types.OK_OPPRETT_MEDLEMSKAPSPERIODE, data: { id: 2 } } as any);
    expect(next.data.medlemskapsperioder).toHaveLength(2);
    expect(next.data.medlemskapsperioder![1]).toEqual({ id: 2 });
  });

  it("OK_OPPDATER_MEDLEMSKAPSPERIODE oppdaterer eksisterende periode", () => {
    const state = { ...initialState, data: { medlemskapsperioder: [{ id: 1, fom: "old" }] } };
    const next = reducer(
      state as any,
      {
        type: Types.OK_OPPDATER_MEDLEMSKAPSPERIODE,
        data: { id: 1, fom: "new" },
      } as any,
    );
    expect(next.data.medlemskapsperioder![0]).toEqual({ id: 1, fom: "new" });
  });

  it("OK_SLETT_MEDLEMSKAPSPERIODE fjerner periode", () => {
    const state = { ...initialState, data: { medlemskapsperioder: [{ id: 1 }, { id: 2 }] } };
    const next = reducer(state as any, { type: Types.OK_SLETT_MEDLEMSKAPSPERIODE, data: { id: 1 } } as any);
    expect(next.data.medlemskapsperioder).toHaveLength(1);
    expect(next.data.medlemskapsperioder![0]).toEqual({ id: 2 });
  });

  it("OK_SLETT_ALLE_MEDLEMSKAPSPERIODER tømmer alle perioder", () => {
    const state = { ...initialState, data: { medlemskapsperioder: [{ id: 1 }, { id: 2 }] } };
    const next = reducer(state as any, { type: Types.OK_SLETT_ALLE_MEDLEMSKAPSPERIODER } as any);
    expect(next.data.medlemskapsperioder).toEqual([]);
  });

  it("RESET tilbakestiller", () => {
    const modified = { status: STATUS.OK, data: { medlemskapsperioder: [{ id: 1 }] } };
    const next = reducer(modified as any, { type: Types.RESET } as any);
    expect(next).toEqual(initialState);
  });
});
