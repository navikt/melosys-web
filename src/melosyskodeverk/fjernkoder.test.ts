import { describe, it, expect } from "vitest";
import * as MKV from "@navikt/melosys-kodeverk";

import { fjernFlereKoder } from "./fjernkoder";

describe("fjernFlereKoder", () => {
  it("fjerner koder fra ekte kodeverk", () => {
    const rensetKodeverk = fjernFlereKoder(MKV, [
      { path: "begrunnelser.vesentlig_virksomhet_begrunnelser", kode: "KONTRAKTER_IKKE_NORSK_LOV" },
    ]);

    expect(
      rensetKodeverk.Koder.begrunnelser.vesentlig_virksomhet_begrunnelser.KONTRAKTER_IKKE_NORSK_LOV,
    ).toBeUndefined();
    expect(
      rensetKodeverk.Terms.begrunnelser.vesentlig_virksomhet_begrunnelser.KONTRAKTER_IKKE_NORSK_LOV,
    ).toBeUndefined();
    expect(
      rensetKodeverk.KTObjects.begrunnelser.vesentlig_virksomhet_begrunnelser.find(
        // @ts-expect-error - Missing properties
        ({ kode }) => kode === MKV.Koder.begrunnelser.vesentlig_virksomhet_begrunnelser.KONTRAKTER_IKKE_NORSK_LOV,
      ),
    ).toBeUndefined();
  });

  it("muterer ikke kodeverk", () => {
    fjernFlereKoder(MKV, [
      { path: "begrunnelser.vesentlig_virksomhet_begrunnelser", kode: "KONTRAKTER_IKKE_NORSK_LOV" },
    ]);

    // @ts-expect-error - Missing properties
    expect(MKV.Koder.begrunnelser.vesentlig_virksomhet_begrunnelser.KONTRAKTER_IKKE_NORSK_LOV).toBeDefined();
    // @ts-expect-error - Missing properties
    expect(MKV.Terms.begrunnelser.vesentlig_virksomhet_begrunnelser.KONTRAKTER_IKKE_NORSK_LOV).toBeDefined();
    expect(
      // @ts-expect-error - Missing properties
      MKV.KTObjects.begrunnelser.vesentlig_virksomhet_begrunnelser.find(
        // @ts-expect-error - Missing properties
        ({ kode }) => kode === MKV.Koder.begrunnelser.vesentlig_virksomhet_begrunnelser.KONTRAKTER_IKKE_NORSK_LOV,
      ),
    ).toBeDefined();
  });

  describe("med mock-data", () => {
    const lagKodeverk = () =>
      ({
        KTObjects: {
          begrunnelser: {
            test: [
              { kode: "A", term: "Alpha" },
              { kode: "B", term: "Beta" },
              { kode: "C", term: "Charlie" },
            ],
          },
        },
        Koder: {
          begrunnelser: { test: { A: "A", B: "B", C: "C" } },
        },
        Terms: {
          begrunnelser: { test: { A: "Alpha", B: "Beta", C: "Charlie" } },
        },
      }) as unknown as typeof MKV;

    it("fjerner angitte koder fra KTObjects", () => {
      const resultat = fjernFlereKoder(lagKodeverk(), [{ path: "begrunnelser.test", kode: "B" }]);
      expect(resultat.KTObjects.begrunnelser.test).toHaveLength(2);
      expect(resultat.KTObjects.begrunnelser.test.map((k: { kode: string }) => k.kode)).toEqual(["A", "C"]);
    });

    it("fjerner kode fra Koder", () => {
      const resultat = fjernFlereKoder(lagKodeverk(), [{ path: "begrunnelser.test", kode: "B" }]);
      expect(resultat.Koder.begrunnelser.test.B).toBeUndefined();
      expect(resultat.Koder.begrunnelser.test.A).toBe("A");
    });

    it("fjerner kode fra Terms", () => {
      const resultat = fjernFlereKoder(lagKodeverk(), [{ path: "begrunnelser.test", kode: "B" }]);
      expect(resultat.Terms.begrunnelser.test.B).toBeUndefined();
    });

    it("kan fjerne flere koder samtidig", () => {
      const resultat = fjernFlereKoder(lagKodeverk(), [
        { path: "begrunnelser.test", kode: "A" },
        { path: "begrunnelser.test", kode: "C" },
      ]);
      expect(resultat.KTObjects.begrunnelser.test).toHaveLength(1);
      expect(resultat.KTObjects.begrunnelser.test[0].kode).toBe("B");
    });
  });
});
