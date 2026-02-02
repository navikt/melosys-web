import { describe, it, expect } from "vitest";
import reducer from "./reducers";
import * as Types from "./types";
import { STATUS } from "../../services";

describe("behandlingsperioder reducer", () => {
  it("returnerer default state", () => {
    const state = reducer(undefined, {});
    expect(state.status).toBe(STATUS.NOT_STARTED);
    expect(state.data).toEqual({});
  });

  it("setter PENDING", () => {
    expect(reducer(undefined, { type: Types.PENDING }).status).toBe(STATUS.PENDING);
  });

  it("setter OK med data", () => {
    const data = { foo: "bar" };
    const next = reducer(undefined, { type: Types.OK, data });
    expect(next.status).toBe(STATUS.OK);
    expect(next.data).toEqual(data);
  });

  it("OPPDATER_BEHANDLINGER setter tidligere_medlemsperiode_ids", () => {
    const next = reducer(undefined, {
      type: Types.OPPDATER_BEHANDLINGER,
      data: { tidligeremedlemskap: [1, 2, 3] },
    });
    expect(next.data).toEqual({ tidligere_medlemsperiode_ids: [1, 2, 3] });
  });

  it("OPPDATER_BEHANDLINGER uten tidligeremedlemskap returnerer uendret state", () => {
    const state = { status: STATUS.OK, data: { foo: "bar" } };
    const next = reducer(state, {
      type: Types.OPPDATER_BEHANDLINGER,
      data: {},
    });
    expect(next.data).toEqual({ foo: "bar" });
  });
});
