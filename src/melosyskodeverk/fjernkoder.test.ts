import { describe, it, expect } from "vitest";
import * as MKV from "@navikt/melosys-kodeverk";

import { fjernFlereKoder } from "./fjernkoder";

describe("fjernFlereKoder", () => {
  it("fjerner koder", () => {
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
});
