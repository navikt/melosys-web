import { describe, it, expect } from "vitest";
import reducer, { initialState } from "./reducers";
import * as Types from "./types";
import { STATUS } from "../../services";

describe("lovvalgsperioder reducer", () => {
  it("returnerer initial state", () => {
    expect(reducer(undefined, {})).toEqual(initialState);
  });

  it("setter PENDING", () => {
    expect(reducer(initialState, { type: Types.PENDING }).status).toBe(STATUS.PENDING);
  });

  it("setter FEILET med data", () => {
    const next = reducer(initialState, { type: Types.FEILET, data: "error" });
    expect(next.status).toBe(STATUS.ERROR);
    expect(next.data).toBe("error");
  });

  it("setter OK med data", () => {
    const data = [{ periodeID: 1, fomDato: "2024-01-01" }];
    const next = reducer(initialState, { type: Types.OK, data });
    expect(next.status).toBe(STATUS.OK);
    expect(next.data).toEqual(data);
  });

  it("RESET tilbakestiller til initial state", () => {
    const modified = { data: [{ periodeID: 1 }], status: STATUS.OK };
    expect(reducer(modified, { type: Types.RESET })).toEqual(initialState);
  });

  it("OPPDATER_LOVVALGSPERIODER erstatter data", () => {
    const data = [{ fomDato: "2024-01-01" }];
    const next = reducer(initialState, { type: Types.OPPDATER_LOVVALGSPERIODER, data });
    expect(next.data).toEqual(data);
    expect(next.status).toBe(STATUS.OK);
  });

  it("OK_OPPDATER_LOVVALGSPERIODE oppdaterer riktig periode", () => {
    const state = {
      data: [
        { periodeID: 1, fomDato: "2024-01-01" },
        { periodeID: 2, fomDato: "2024-06-01" },
      ],
      status: STATUS.OK,
    };
    const next = reducer(state, {
      type: Types.OK_OPPDATER_LOVVALGSPERIODE,
      data: { periodeID: 1, fomDato: "2024-03-01" },
    });
    expect(next.data[0].fomDato).toBe("2024-03-01");
    expect(next.data[1].fomDato).toBe("2024-06-01");
  });

  it("OK_SLETT_LOVVALGSPERIODE fjerner riktig periode", () => {
    const state = {
      data: [
        { periodeID: 1, fomDato: "2024-01-01" },
        { periodeID: 2, fomDato: "2024-06-01" },
      ],
      status: STATUS.OK,
    };
    const next = reducer(state, {
      type: Types.OK_SLETT_LOVVALGSPERIODE,
      data: { periodeID: 1 },
    });
    expect(next.data).toHaveLength(1);
    expect(next.data[0].periodeID).toBe(2);
  });

  it("ENDRE_PERIODE oppdaterer fom/tom på første periode", () => {
    const state = {
      data: [{ periodeID: 1, fomDato: "2024-01-01", tomDato: "2024-12-31" }],
      status: STATUS.OK,
    };
    const next = reducer(state, {
      type: Types.ENDRE_PERIODE,
      data: { fomDato: "2024-03-01", tomDato: "2024-09-30" },
    });
    expect(next.data[0].fomDato).toBe("2024-03-01");
    expect(next.data[0].tomDato).toBe("2024-09-30");
  });
});
