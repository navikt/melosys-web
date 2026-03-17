import { describe, expect, it } from "vitest";
import { mapTilMedlemskapsperiodeFieldProps, mapMedlemskapsperioder } from "./aarsavregningUtenEllerDeltGrunnlag";
import { MedlemskapsperiodeForAvgift } from "../../../../../services/modules/types/periodeTyper";

type MedlemskapsperiodeFieldPropsNarrowed = MedlemskapsperiodeForAvgift & { redigerbar: boolean; feil?: string };

describe("mapTilMedlemskapsperiodeFieldProps", () => {
  const lagMedlemskapsperiode = (overrides?: Partial<MedlemskapsperiodeForAvgift>): MedlemskapsperiodeForAvgift => ({
    id: 1,
    type: "MEDLEMSKAPSPERIODE",
    fomDato: "2023-01-01",
    tomDato: "2023-12-31",
    bestemmelse: "FTRL_2_7",
    medlemskapstype: "PLIKTIG",
    innvilgelsesResultat: "INNVILGET",
    trygdedekning: "FULL_DEKNING_FTRL",
    ...overrides,
  });

  it("skal konvertere ISO-datoer til norsk format", () => {
    const periode = lagMedlemskapsperiode({
      fomDato: "2023-01-01",
      tomDato: "2023-12-31",
    });

    const resultat = mapTilMedlemskapsperiodeFieldProps(periode);

    expect(resultat.fomDato).toBe("01.01.2023");
    expect(resultat.tomDato).toBe("31.12.2023");
  });

  it("skal ikke returnere blanke datoer for gyldige ISO-datoer", () => {
    const periode = lagMedlemskapsperiode({
      fomDato: "2024-06-15",
      tomDato: "2024-11-30",
    });

    const resultat = mapTilMedlemskapsperiodeFieldProps(periode);

    expect(resultat.fomDato).not.toBe("");
    expect(resultat.tomDato).not.toBe("");
    expect(resultat.fomDato).toBe("15.06.2024");
    expect(resultat.tomDato).toBe("30.11.2024");
  });

  it("skal beholde type-felt fra Avgiftspliktigperiode", () => {
    const periode = lagMedlemskapsperiode();

    const resultat = mapTilMedlemskapsperiodeFieldProps(periode);

    expect(resultat.type).toBe("MEDLEMSKAPSPERIODE");
  });

  it("skal beholde alle felt fra MedlemskapsperiodeForAvgift", () => {
    const periode = lagMedlemskapsperiode({
      id: 42,
      bestemmelse: "FTRL_2_9",
      medlemskapstype: "FRIVILLIG",
      innvilgelsesResultat: "INNVILGET",
      trygdedekning: "FULL_DEKNING_FTRL",
    });

    const resultat = mapTilMedlemskapsperiodeFieldProps(periode) as MedlemskapsperiodeFieldPropsNarrowed;

    expect(resultat.id).toBe(42);
    expect(resultat.bestemmelse).toBe("FTRL_2_9");
    expect(resultat.medlemskapstype).toBe("FRIVILLIG");
    expect(resultat.innvilgelsesResultat).toBe("INNVILGET");
    expect(resultat.trygdedekning).toBe("FULL_DEKNING_FTRL");
  });

  it("skal sette redigerbar=true når periode ikke finnes i sisteGjeldendeAvgiftspliktigePerioder", () => {
    const periode = lagMedlemskapsperiode({
      fomDato: "2023-01-01",
      tomDato: "2023-06-30",
    });
    const sisteGjeldende = [
      {
        type: "MEDLEMSKAPSPERIODE" as const,
        id: 99,
        fomDato: "2023-07-01",
        tomDato: "2023-12-31",
        bestemmelse: "FTRL_2_7",
        medlemskapstype: "PLIKTIG",
        innvilgelsesResultat: "INNVILGET",
        trygdedekning: "FULL_DEKNING_FTRL",
      },
    ];

    const resultat = mapTilMedlemskapsperiodeFieldProps(periode, sisteGjeldende);

    expect(resultat.redigerbar).toBe(true);
  });

  it("skal sette redigerbar=false når periode finnes i sisteGjeldendeAvgiftspliktigePerioder", () => {
    const periode = lagMedlemskapsperiode({
      fomDato: "2023-01-01",
      tomDato: "2023-12-31",
    });
    const sisteGjeldende = [
      {
        type: "MEDLEMSKAPSPERIODE" as const,
        id: 99,
        fomDato: "2023-01-01",
        tomDato: "2023-12-31",
        bestemmelse: "FTRL_2_7",
        medlemskapstype: "PLIKTIG",
        innvilgelsesResultat: "INNVILGET",
        trygdedekning: "FULL_DEKNING_FTRL",
      },
    ];

    const resultat = mapTilMedlemskapsperiodeFieldProps(periode, sisteGjeldende);

    expect(resultat.redigerbar).toBe(false);
  });

  it("skal sette redigerbar=true når sisteGjeldendeAvgiftspliktigePerioder er undefined", () => {
    const periode = lagMedlemskapsperiode();

    const resultat = mapTilMedlemskapsperiodeFieldProps(periode, undefined);

    expect(resultat.redigerbar).toBe(true);
  });
});

describe("mapMedlemskapsperioder", () => {
  it("skal sortere perioder kronologisk og konvertere datoer", () => {
    const perioder: MedlemskapsperiodeForAvgift[] = [
      {
        id: 2,
        type: "MEDLEMSKAPSPERIODE",
        fomDato: "2023-07-01",
        tomDato: "2023-12-31",
        bestemmelse: "FTRL_2_7",
        medlemskapstype: "PLIKTIG",
        innvilgelsesResultat: "INNVILGET",
        trygdedekning: "FULL_DEKNING_FTRL",
      },
      {
        id: 1,
        type: "MEDLEMSKAPSPERIODE",
        fomDato: "2023-01-01",
        tomDato: "2023-06-30",
        bestemmelse: "FTRL_2_7",
        medlemskapstype: "PLIKTIG",
        innvilgelsesResultat: "INNVILGET",
        trygdedekning: "FULL_DEKNING_FTRL",
      },
    ];

    const resultat = mapMedlemskapsperioder(perioder);

    expect(resultat).toHaveLength(2);
    expect(resultat[0].fomDato).toBe("01.01.2023");
    expect(resultat[0].tomDato).toBe("30.06.2023");
    expect(resultat[1].fomDato).toBe("01.07.2023");
    expect(resultat[1].tomDato).toBe("31.12.2023");
  });

  it("skal beholde type-felt på alle perioder", () => {
    const perioder: MedlemskapsperiodeForAvgift[] = [
      {
        id: 1,
        type: "MEDLEMSKAPSPERIODE",
        fomDato: "2023-01-01",
        tomDato: "2023-12-31",
        bestemmelse: "FTRL_2_7",
        medlemskapstype: "PLIKTIG",
        innvilgelsesResultat: "INNVILGET",
        trygdedekning: "FULL_DEKNING_FTRL",
      },
    ];

    const resultat = mapMedlemskapsperioder(perioder);

    expect(resultat.every((p) => p.type === "MEDLEMSKAPSPERIODE")).toBe(true);
  });

  it("skal håndtere tom array", () => {
    const resultat = mapMedlemskapsperioder([]);

    expect(resultat).toEqual([]);
  });
});
