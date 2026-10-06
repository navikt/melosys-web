import { describe, it, expect } from "vitest";
import reducer, { initialState } from "./reducers";
import * as Types from "./types";
import { STATUS } from "../../services";
import { LovvalgsperioderSelector } from "./selectors";

describe("lovvalgsperioder reducer", () => {
  it("returnerer initial state", () => {
    expect(reducer(undefined, {})).toEqual(initialState);
  });

  it("setter PENDING", () => {
    expect(reducer(initialState, { type: Types.PENDING }).status).toBe(STATUS.PENDING);
  });

  describe("FEILET", () => {
    const perioder = [
      { periodeID: 1, fomDato: "2027-01-01", tomDato: "2027-12-31", lovvalgsbestemmelse: "FO_883_2004_ART13_1A" },
    ];
    const feilsvar = { response: { status: 500 }, data: { message: "Unexpected row count" } };
    const etterFeil = (): any =>
      reducer({ data: perioder, status: STATUS.OK } as any, { type: Types.FEILET, data: feilsvar });

    it("beholder periodene og legger feilen i feil", () => {
      const next = etterFeil();
      expect(next.status).toBe(STATUS.ERROR);
      expect(next.data).toEqual(perioder);
      expect(next.feil).toEqual(feilsvar);
    });

    it("lar selektoren gi de samme periodene som før", () => {
      expect(LovvalgsperioderSelector({ lovvalgsperioder: etterFeil() })).toEqual(perioder);
    });

    it("lar ENDRE_PERIODE beholde bestemmelsen", () => {
      const next = reducer(etterFeil(), {
        type: Types.ENDRE_PERIODE,
        data: { fomDato: "2027-01-01", tomDato: "2027-06-30" },
      });
      expect(next.data).toEqual([{ ...perioder[0], tomDato: "2027-06-30" }]);
    });

    it("OK fjerner feilen", () => {
      const next: any = reducer(etterFeil(), { type: Types.OK, data: perioder });
      expect(next.status).toBe(STATUS.OK);
      expect(next.feil).toBeUndefined();
    });
  });

  it("setter OK med data", () => {
    const data = [{ periodeID: 1, fomDato: "2024-01-01" }];
    const next = reducer(initialState, { type: Types.OK, data });
    expect(next.status).toBe(STATUS.OK);
    expect(next.data).toEqual(data);
  });

  it("RESET tilbakestiller til initial state", () => {
    const modified = { data: [{ periodeID: 1 }], status: STATUS.OK } as any;
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
    } as any;
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
    } as any;
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
    } as any;
    const next = reducer(state, {
      type: Types.ENDRE_PERIODE,
      data: { fomDato: "2024-03-01", tomDato: "2024-09-30" },
    });
    expect(next.data[0].fomDato).toBe("2024-03-01");
    expect(next.data[0].tomDato).toBe("2024-09-30");
  });
});
