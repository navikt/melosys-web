import { describe, it, expect } from "vitest";
import reducer from "./reducers";
import * as Types from "./types";
import { STATUS } from "../../services";

const initialState = { status: STATUS.NOT_STARTED, data: {} };

describe("pensjonsopptjening reducer", () => {
  it("returnerer initial state", () => {
    expect(reducer(undefined, { type: "@@INIT" } as any)).toEqual(initialState);
  });

  it("PENDING setter status til PENDING uten å røre data", () => {
    const state = reducer(
      { status: STATUS.OK, data: { inntektsAr: 2024, perioder: [] } },
      {
        type: Types.PENDING,
      },
    );
    expect(state.status).toBe(STATUS.PENDING);
    expect(state.data).toEqual({ inntektsAr: 2024, perioder: [] });
  });

  it("OK lagrer data og fjerner tidligere feil", () => {
    const respons = {
      inntektsAr: 2024,
      perioder: [
        {
          aar: 2024,
          pgi: 100,
          kilde: "SKATT" as const,
          inntektType: "SUM_PI",
          inntektTypeDekode: "Sum pensjonsgivende inntekt",
        },
      ],
    };
    const state = reducer({ status: STATUS.PENDING, data: {}, feil: "noe" }, { type: Types.OK, data: respons });
    expect(state.status).toBe(STATUS.OK);
    expect(state.data).toEqual(respons);
    expect(state.feil).toBeUndefined();
  });

  it("FEILET lagrer feilen i feil-feltet og nullstiller data — også for ren streng (nettverksfeil)", () => {
    const stringError = "TypeError: Failed to fetch";
    const state = reducer(undefined, { type: Types.FEILET, data: stringError });
    expect(state.status).toBe(STATUS.ERROR);
    expect(state.data).toEqual({});
    expect(state.feil).toBe(stringError);
  });

  it("FEILET fanger også opp Error-objekter", () => {
    const err = new Error("oops");
    const state = reducer(undefined, { type: Types.FEILET, data: err });
    expect(state.status).toBe(STATUS.ERROR);
    expect(state.feil).toBe(err);
  });

  it("RESET returnerer til initial state", () => {
    const state = reducer(
      { status: STATUS.OK, data: { inntektsAr: 2024, perioder: [] } },
      {
        type: Types.RESET,
      },
    );
    expect(state).toEqual(initialState);
  });
});
