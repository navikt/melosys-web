import { describe, it, expect } from "vitest";
import * as selectors from "./selectors";
import * as DucksTestUtils from "../test-utils";
import { STATUS } from "../../services";

const lagState = (data: any = {}) =>
  DucksTestUtils.lagState({
    oppsummertfakta: { status: STATUS.OK, data },
  });

describe("oppsummertfakta selectors", () => {
  it("VirksomhetIDerSelector returnerer IDer", () => {
    const state = lagState({ virksomheter: { virksomhetIDer: [1, 2, 3] } });
    expect(selectors.VirksomhetIDerSelector(state)).toEqual([1, 2, 3]);
  });

  it("VirksomhetIDerSelector returnerer tom liste når virksomheter mangler", () => {
    expect(selectors.VirksomhetIDerSelector(lagState({}))).toEqual([]);
  });

  it("FullstendigManglendeInnbetalingSelector returnerer verdi", () => {
    const state = lagState({ fullstendigManglendeInnbetaling: true });
    expect(selectors.FullstendigManglendeInnbetalingSelector(state)).toBe(true);
  });

  it("IkkeYrkesaktivRelasjonSelector returnerer relasjonstype", () => {
    const state = lagState({ ikkeYrkesaktivFamilieRelasjonstype: "EKTEFELLE" });
    expect(selectors.IkkeYrkesaktivRelasjonSelector(state)).toBe("EKTEFELLE");
  });

  it("ArbeidssituasjonSelector returnerer arbeidssituasjonType", () => {
    const state = lagState({ arbeidssituasjonType: "ARBEIDSTAKER" });
    expect(selectors.ArbeidssituasjonSelector(state)).toBe("ARBEIDSTAKER");
  });

  it("UkjentSluttdatoMedlemskapsperiodeSelector returnerer verdi", () => {
    const state = lagState({ ukjentSluttdatoMedlemskapsperiode: true });
    expect(selectors.UkjentSluttdatoMedlemskapsperiodeSelector(state)).toBe(true);
  });

  it("IkkeYrkesaktivOppholdSelector returnerer oppholdstype", () => {
    const state = lagState({ ikkeYrkesaktivOppholdstype: "MIDLERTIDIG" });
    expect(selectors.IkkeYrkesaktivOppholdSelector(state)).toBe("MIDLERTIDIG");
  });

  it("VirksomheterSelector returnerer virksomheter-objekt", () => {
    const virksomheter = { virksomhetIDer: [1] };
    const state = lagState({ virksomheter });
    expect(selectors.VirksomheterSelector(state)).toEqual(virksomheter);
  });

  it("OppsummertFaktaDataSelector returnerer data", () => {
    const data = { arbeidssituasjonType: "TEST" };
    const state = lagState(data);
    expect(selectors.OppsummertFaktaDataSelector(state)).toEqual(data);
  });
});
