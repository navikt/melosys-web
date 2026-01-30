import { describe, it, expect } from "vitest";
import * as selectors from "./selectors";
import * as DucksTestUtils from "../test-utils";
import { STATUS } from "../../services/utils";

const lagState = (data: any = {}) =>
  DucksTestUtils.lagState({
    journalforing: { status: STATUS.OK, data },
  });

describe("journalforing selectors", () => {
  it("JournalforingAlle returnerer data eller tom objekt", () => {
    expect(selectors.JournalforingAlle(lagState(null))).toEqual({});
    expect(selectors.JournalforingAlle(lagState({ brukerID: "123" }))).toEqual({ brukerID: "123" });
  });

  it("JournalforingHovedDokument returnerer hoveddokument med defaults", () => {
    const result = selectors.JournalforingHovedDokument(lagState({}));
    expect(result).toEqual({ tittel: "", dokumentID: null, logiskeVedlegg: [] });
  });

  it("JournalforingHovedDokument returnerer faktisk hoveddokument", () => {
    const state = lagState({ hoveddokument: { tittel: "Søknad", dokumentID: "42", logiskeVedlegg: ["v1"] } });
    expect(selectors.JournalforingHovedDokumentTittelSelector(state)).toBe("Søknad");
    expect(selectors.JournalforingLogiskeVedleggSelector(state)).toEqual(["v1"]);
  });

  it("JournalforingVedleggsDokumenter returnerer vedlegg eller tom liste", () => {
    expect(selectors.JournalforingVedleggsDokumenter(lagState({}))).toEqual([]);
    expect(selectors.JournalforingVedleggsDokumenter(lagState({ vedlegg: [{ id: 1 }] }))).toEqual([{ id: 1 }]);
  });

  it("BrukerIDSelector returnerer brukerID", () => {
    expect(selectors.BrukerIDSelector(lagState({ brukerID: "12345678901" }))).toBe("12345678901");
  });

  it("ErAvsenderPreutfyltSelector returnerer true når alle felt er satt", () => {
    const state = lagState({ avsenderID: "1", avsenderNavn: "NAV", avsenderType: "ORGANISASJON" });
    expect(selectors.ErAvsenderPreutfyltSelector(state)).toBe(true);
  });

  it("ErAvsenderPreutfyltSelector returnerer false når felt mangler", () => {
    const state = lagState({ avsenderID: "1", avsenderNavn: null, avsenderType: "ORGANISASJON" });
    expect(selectors.ErAvsenderPreutfyltSelector(state)).toBe(false);
  });
});
