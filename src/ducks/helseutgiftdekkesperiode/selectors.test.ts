import { describe, it, expect } from "vitest";
import * as selectors from "./selectors";
import { STATUS } from "../../services";

const lagState = (helseutgiftdekkesperiode: any) => ({ helseutgiftdekkesperiode }) as any;

describe("helseutgiftdekkesperiode selectors", () => {
  it("HelseutgiftDekkesPeriodeSelector returnerer state ved OK", () => {
    const state = lagState({ status: STATUS.OK, data: { fom: "2024-01-01" } });
    const result = selectors.HelseutgiftDekkesPeriodeSelector(state);
    expect(result.data).toEqual({ fom: "2024-01-01" });
  });

  it("HelseutgiftDekkesPeriodeSelector returnerer tom data ved ERROR", () => {
    const state = lagState({ status: STATUS.ERROR, data: { fom: "2024-01-01" } });
    const result = selectors.HelseutgiftDekkesPeriodeSelector(state);
    expect(result.data).toEqual({});
    expect(result.status).toBe(STATUS.ERROR);
  });

  it("HelseutgiftDekkesPeriodeErPendingSelector returnerer true ved PENDING", () => {
    const state = lagState({ status: STATUS.PENDING, data: {} });
    expect(selectors.HelseutgiftDekkesPeriodeErPendingSelector(state)).toBe(true);
  });

  it("HelseutgiftDekkesPeriodeErPendingSelector returnerer false ved OK", () => {
    const state = lagState({ status: STATUS.OK, data: {} });
    expect(selectors.HelseutgiftDekkesPeriodeErPendingSelector(state)).toBe(false);
  });
});
