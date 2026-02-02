import { describe, it, expect } from "vitest";
import { BekreftValgTypes } from "./bekreftValgTypes";

describe("BekreftValgTypes", () => {
  it("inneholder alle forventede verdier", () => {
    expect(BekreftValgTypes.FERDIGBEHANDLET).toBeDefined();
    expect(BekreftValgTypes.VEDTAKET_ER_OMGJORT).toBeDefined();
    expect(BekreftValgTypes.SOKNADEN_ER_INNVILGET).toBeDefined();
    expect(BekreftValgTypes.SOKNADEN_ER_AVSLATT).toBeDefined();
    expect(BekreftValgTypes.PERIODEN_ER_GODKJENT).toBeDefined();
    expect(BekreftValgTypes.PERIODEN_ER_DELVIS_GODKJENT).toBeDefined();
    expect(BekreftValgTypes.MEDLEM_I_FOLKETRYGDEN).toBeDefined();
    expect(BekreftValgTypes.KLAGE_MEDHOLD).toBeDefined();
    expect(BekreftValgTypes.KLAGE_AVVIST).toBeDefined();
    expect(BekreftValgTypes.KLAGE_OVERSENDT_TIL_KLAGEINSTANSER).toBeDefined();
    expect(BekreftValgTypes.AVSLUTT_SAK_SOM_BORTFALT).toBeDefined();
    expect(BekreftValgTypes.SAKEN_ER_ANNULLERT).toBeDefined();
  });

  it("har 12 verdier", () => {
    const values = Object.keys(BekreftValgTypes).filter((k) => isNaN(Number(k)));
    expect(values).toHaveLength(12);
  });
});
