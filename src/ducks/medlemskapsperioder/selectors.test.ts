import { describe, it, expect } from "vitest";
import * as selectors from "./selectors";
import * as DucksTestUtils from "../test-utils";
import { STATUS } from "../../services/utils";
import MKV from "../../melosyskodeverk";

const { INNVILGET, DELVIS_INNVILGET } = MKV.Koder.innvilgelsesResultat;

const lagState = (perioder: any[] = []) =>
  DucksTestUtils.lagState({
    medlemskapsperioder: {
      status: STATUS.OK,
      data: { medlemskapsperioder: perioder },
    },
  });

describe("medlemskapsperioder selectors", () => {
  it("AlleMedlemskapsperioderSelector returnerer perioder", () => {
    const state = lagState([{ id: 1 }]);
    expect(selectors.AlleMedlemskapsperioderSelector(state)).toEqual([{ id: 1 }]);
  });

  it("AlleMedlemskapsperioderSelector returnerer tom liste når mangler", () => {
    const state = DucksTestUtils.lagState({
      medlemskapsperioder: { status: STATUS.OK, data: {} },
    });
    expect(selectors.AlleMedlemskapsperioderSelector(state)).toEqual([]);
  });

  it("InnvilgetEllerDelvisInnvilgetMedlemskapsperioderSelector filtrerer riktig", () => {
    const state = lagState([
      { id: 1, innvilgelsesResultat: INNVILGET },
      { id: 2, innvilgelsesResultat: "AVSLAATT" },
      { id: 3, innvilgelsesResultat: DELVIS_INNVILGET },
    ]);
    const result = selectors.InnvilgetEllerDelvisInnvilgetMedlemskapsperioderSelector(state);
    expect(result).toHaveLength(2);
    expect(result.map((p: any) => p.id)).toEqual([1, 3]);
  });

  it("SamletInnvilgetMedlemskapsperiodeSelector returnerer samlet periode", () => {
    const state = lagState([
      { innvilgelsesResultat: INNVILGET, fomDato: "2024-06-01", tomDato: "2024-12-31" },
      { innvilgelsesResultat: INNVILGET, fomDato: "2024-01-01", tomDato: "2024-05-31" },
      { innvilgelsesResultat: "AVSLAATT", fomDato: "2023-01-01", tomDato: "2023-12-31" },
    ]);
    const result = selectors.SamletInnvilgetMedlemskapsperiodeSelector(state);
    expect(result).toEqual({ fom: "2024-01-01", tom: "2024-12-31" });
  });

  it("SamletInnvilgetMedlemskapsperiodeSelector returnerer undefined når ingen innvilget", () => {
    const state = lagState([{ innvilgelsesResultat: "AVSLAATT", fomDato: "2024-01-01", tomDato: "2024-12-31" }]);
    expect(selectors.SamletInnvilgetMedlemskapsperiodeSelector(state)).toBeUndefined();
  });

  it("BestemmelseSelector returnerer bestemmelse fra tidligste periode", () => {
    const state = lagState([
      { fomDato: "2024-06-01", bestemmelse: "ART12_2" },
      { fomDato: "2024-01-01", bestemmelse: "ART12_1" },
    ]);
    expect(selectors.BestemmelseSelector(state)).toBe("ART12_1");
  });

  it("BestemmelseSelector returnerer tom streng når ingen perioder", () => {
    expect(selectors.BestemmelseSelector(lagState([]))).toBe("");
  });

  it("MedlemskapsperioderStatusSelector returnerer status", () => {
    const state = DucksTestUtils.lagState({
      medlemskapsperioder: { status: STATUS.PENDING, data: {} },
    });
    expect(selectors.MedlemskapsperioderStatusSelector(state)).toBe(STATUS.PENDING);
  });
});
