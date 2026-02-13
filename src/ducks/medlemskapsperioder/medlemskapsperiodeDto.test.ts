import { describe, expect, it } from "vitest";
import { MedlemskapsperiodeDto } from "../../services/modules/types/periodeTyper";
import { AlleMedlemskapsperioderSelector } from "./selectors";

describe("MedlemskapsperiodeDto uten type-felt", () => {
  it("skal kunne sjekke medlemskapstype uten at type-felt eksisterer", () => {
    const perioder: MedlemskapsperiodeDto[] = [
      {
        id: 1,
        fomDato: "2023-01-01",
        tomDato: "2023-12-31",
        bestemmelse: "FTRL_2_7",
        medlemskapstype: "PLIKTIG",
        innvilgelsesResultat: "INNVILGET",
        trygdedekning: "FULL_DEKNING_FTRL",
      },
    ];

    // MedlemskapsperiodeDto har IKKE type-felt - verifiser at feltet er undefined
    expect((perioder[0] as any).type).toBeUndefined();

    // Sjekk at medlemskapstype fortsatt kan leses korrekt
    const erPliktig = perioder.some((p) => p.medlemskapstype === "PLIKTIG");
    expect(erPliktig).toBe(true);
  });

  it("skal kunne filtrere på innvilgelsesResultat uten type-felt", () => {
    const perioder: MedlemskapsperiodeDto[] = [
      {
        id: 1,
        fomDato: "2023-01-01",
        tomDato: "2023-06-30",
        bestemmelse: "FTRL_2_7",
        medlemskapstype: "PLIKTIG",
        innvilgelsesResultat: "INNVILGET",
        trygdedekning: "FULL_DEKNING_FTRL",
      },
      {
        id: 2,
        fomDato: "2023-07-01",
        tomDato: "2023-12-31",
        bestemmelse: "FTRL_2_7",
        medlemskapstype: "FRIVILLIG",
        innvilgelsesResultat: "AVSLAATT",
        trygdedekning: "FULL_DEKNING_FTRL",
      },
    ];

    const innvilgede = perioder.filter((p) => p.innvilgelsesResultat === "INNVILGET");
    expect(innvilgede).toHaveLength(1);
    expect(innvilgede[0].id).toBe(1);
  });

  it("skal fungere korrekt med AlleMedlemskapsperioderSelector", () => {
    const state = {
      medlemskapsperioder: {
        data: {
          medlemskapsperioder: [
            {
              id: 1,
              fomDato: "2023-01-01",
              tomDato: "2023-12-31",
              bestemmelse: "FTRL_2_7",
              medlemskapstype: "PLIKTIG",
              innvilgelsesResultat: "INNVILGET",
              trygdedekning: "FULL_DEKNING_FTRL",
            },
          ],
        },
        status: "OK",
        error: null,
      },
    } as any;

    const perioder = AlleMedlemskapsperioderSelector(state);

    expect(perioder).toHaveLength(1);
    expect(perioder[0].medlemskapstype).toBe("PLIKTIG");
    expect((perioder[0] as any).type).toBeUndefined();
  });
});
