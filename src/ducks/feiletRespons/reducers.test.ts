import { describe, it, expect } from "vitest";
import reducer from "./reducers";
import * as Types from "./types";
import { utpekTypes } from "../utpek";
import { vedtakTypes } from "../vedtak";
import { videresendingTypes } from "../videresending";
import { anmodningunntakTypes } from "../anmodningunntak";
import { fagsakTypes } from "../fagsaker";
import { kontrollTypes } from "../kontroll";
import { sokTypes } from "../sok";
import { STATUS } from "../../services/utils";

describe("feiletRespons reducer", () => {
  it("returnerer initial state", () => {
    const state = reducer(undefined, {} as any);
    expect(state.status).toBe(STATUS.NOT_STARTED);
    expect(state.data).toEqual({});
  });

  it("RESET tilbakestiller", () => {
    const modified = { status: STATUS.ERROR, data: { error: true } };
    const next = reducer(modified as any, { type: Types.RESET } as any);
    expect(next.status).toBe(STATUS.NOT_STARTED);
    expect(next.data).toEqual({});
  });

  it.each([
    ["utpek", utpekTypes.FEILET],
    ["vedtak", vedtakTypes.FEILET],
    ["videresending", videresendingTypes.FEILET],
    ["anmodningunntak", anmodningunntakTypes.FEILET],
    ["fagsaker", fagsakTypes.FEILET],
    ["kontroll", kontrollTypes.FEILET],
    ["sok", sokTypes.FEILET],
  ])("setter ERROR ved %s FEILET", (_name, type) => {
    const next = reducer(undefined, { type, data: { error: true } } as any);
    expect(next.status).toBe(STATUS.ERROR);
    expect(next.data).toEqual({ error: true });
  });

  it.each([
    ["utpek", utpekTypes.OK],
    ["vedtak", vedtakTypes.OK],
    ["videresending", videresendingTypes.OK],
    ["anmodningunntak", anmodningunntakTypes.OK],
    ["fagsaker", fagsakTypes.OK],
    ["kontroll", kontrollTypes.OK],
    ["sok", sokTypes.OK],
  ])("resetter ved %s OK", (_name, type) => {
    const modified = { status: STATUS.ERROR, data: { error: true } };
    const next = reducer(modified as any, { type, data: {} } as any);
    expect(next.status).toBe(STATUS.OK);
    expect(next.data).toEqual({});
  });
});
