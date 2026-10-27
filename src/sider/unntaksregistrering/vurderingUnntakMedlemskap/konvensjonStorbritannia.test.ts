import { describe, it, expect } from "vitest";
import MKV from "../../../melosyskodeverk";
import {
  erKonvensjonStorbritanniaFørIkrafttredelse,
  erUtsendingStorbritanniaOver24Måneder,
} from "./konvensjonStorbritannia";

const { KONV_EFTA_STORBRITANNIA_ART14_1, KONV_EFTA_STORBRITANNIA_ART14_2, KONV_EFTA_STORBRITANNIA_ART16_1 } =
  MKV.Koder.lovvalgsbestemmelser.lovvalgbestemmelser_konv_efta_storbritannia;
const { KONV_EFTA_STORBRITANNIA_ART13_5 } = MKV.Koder.lovvalgsbestemmelser.tilleggsbestemmelser_konv_efta_storbritannia;
const { UK_ART6_1 } = MKV.Koder.lovvalgsbestemmelser.trygdeavtale.lovvalgsbestemmelser_trygdeavtale_gb;

describe("erKonvensjonStorbritanniaFørIkrafttredelse", () => {
  it("er sann for konvensjonsbestemmelse med startdato før 1. januar 2024", () => {
    expect(erKonvensjonStorbritanniaFørIkrafttredelse("31.12.2023", KONV_EFTA_STORBRITANNIA_ART14_1)).toBe(true);
  });

  it("er sann for tilleggsbestemmelse i konvensjonen med startdato før 1. januar 2024", () => {
    expect(erKonvensjonStorbritanniaFørIkrafttredelse("01.06.2023", KONV_EFTA_STORBRITANNIA_ART13_5)).toBe(true);
  });

  it("er usann for konvensjonsbestemmelse med startdato 1. januar 2024", () => {
    expect(erKonvensjonStorbritanniaFørIkrafttredelse("01.01.2024", KONV_EFTA_STORBRITANNIA_ART14_1)).toBe(false);
  });

  it("er usann for bestemmelse som ikke er etter konvensjonen", () => {
    expect(erKonvensjonStorbritanniaFørIkrafttredelse("01.06.2023", UK_ART6_1)).toBe(false);
  });

  it("er usann uten bestemmelse eller startdato", () => {
    expect(erKonvensjonStorbritanniaFørIkrafttredelse("01.06.2023", "")).toBe(false);
    expect(erKonvensjonStorbritanniaFørIkrafttredelse("", KONV_EFTA_STORBRITANNIA_ART14_1)).toBe(false);
  });
});

describe("erUtsendingStorbritanniaOver24Måneder", () => {
  it("er usann for periode på nøyaktig 24 måneder", () => {
    expect(erUtsendingStorbritanniaOver24Måneder("01.01.2024", "31.12.2025", KONV_EFTA_STORBRITANNIA_ART14_1)).toBe(
      false,
    );
  });

  it("er sann for periode på 24 måneder og én dag med art. 14 nr. 1", () => {
    expect(erUtsendingStorbritanniaOver24Måneder("01.01.2024", "01.01.2026", KONV_EFTA_STORBRITANNIA_ART14_1)).toBe(
      true,
    );
  });

  it("er sann for periode over 24 måneder med art. 14 nr. 2", () => {
    expect(erUtsendingStorbritanniaOver24Måneder("15.03.2024", "15.03.2026", KONV_EFTA_STORBRITANNIA_ART14_2)).toBe(
      true,
    );
  });

  it("er usann for periode over 24 måneder med annen bestemmelse", () => {
    expect(erUtsendingStorbritanniaOver24Måneder("01.01.2024", "01.01.2027", KONV_EFTA_STORBRITANNIA_ART16_1)).toBe(
      false,
    );
  });

  it("er usann uten sluttdato", () => {
    expect(erUtsendingStorbritanniaOver24Måneder("01.01.2024", "", KONV_EFTA_STORBRITANNIA_ART14_1)).toBe(false);
  });
});
