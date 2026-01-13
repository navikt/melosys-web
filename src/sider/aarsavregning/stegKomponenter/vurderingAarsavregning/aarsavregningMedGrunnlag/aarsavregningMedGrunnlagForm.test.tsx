import { yupResolver } from "@hookform/resolvers/yup";
import { renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { useForm } from "react-hook-form";
import aarsavregningMedGrunnlagSchema from "./aarsavregningMedGrunnlagSchema";
import MKV from "../../../../../melosyskodeverk";
import { Avgiftspliktigperiode } from "../../../../../services/modules/types/periodeTyper";
import { finnMedlemskapsperiode } from "../utils";

const { MANUELL_ENDELIG_AVGIFT } = MKV.Koder.endeligAvgiftValg;

describe("aarsavregningMedGrunnlagForm validering", () => {
  it("skal tillate 0 kr som endelig beregnet trygdeavgift", async () => {
    const { result } = renderHook(() =>
      useForm({
        resolver: yupResolver(aarsavregningMedGrunnlagSchema),
        mode: "all",
        defaultValues: {
          endeligAvgiftValg: MANUELL_ENDELIG_AVGIFT,
          manueltAvgiftBeloep: "0",
          skatteforholdsperioder: [],
          inntektskilder: [],
        },
      }),
    );

    const isValid = await result.current.trigger();

    expect(isValid).toBe(true);
  });

  it("skal kreve at feltet fylles ut når MANUELL_ENDELIG_AVGIFT er valgt", async () => {
    const { result } = renderHook(() =>
      useForm({
        resolver: yupResolver(aarsavregningMedGrunnlagSchema),
        mode: "all",
        defaultValues: {
          endeligAvgiftValg: MANUELL_ENDELIG_AVGIFT,
          manueltAvgiftBeloep: "",
          skatteforholdsperioder: [],
          inntektskilder: [],
        },
      }),
    );

    const isValid = await result.current.trigger("manueltAvgiftBeloep");

    expect(isValid).toBe(false);
  });
});

describe("finnMedlemskapsperiode logikk", () => {
  it("skal finne sammensatt periode fra flere medlemskapsperioder", () => {
    const perioder: Avgiftspliktigperiode[] = [
      {
        type: "MEDLEMSKAPSPERIODE",
        id: 1,
        fomDato: "01.01.2023",
        tomDato: "30.06.2023",
        bestemmelse: "FTRL_2_7",
        innvilgelsesResultat: "INNVILGET",
        trygdedekning: "FULL_DEKNING",
        medlemskapstype: "PLIKTIG",
      },
      {
        type: "MEDLEMSKAPSPERIODE",
        id: 2,
        fomDato: "01.07.2023",
        tomDato: "31.12.2023",
        bestemmelse: "FTRL_2_8",
        innvilgelsesResultat: "INNVILGET",
        trygdedekning: "DELVIS_DEKNING",
        medlemskapstype: "PLIKTIG",
      },
    ];

    const result = finnMedlemskapsperiode(perioder);

    expect(result).toEqual({
      fomDato: "01.01.2023",
      tomDato: "31.12.2023",
    });
  });

  it("skal håndtere tom liste og returnere undefined", () => {
    const perioder: Avgiftspliktigperiode[] = [];

    const result = finnMedlemskapsperiode(perioder);

    expect(result).toBeUndefined();
  });

  it("skal filtrere bort perioder uten fomDato", () => {
    const perioder: Avgiftspliktigperiode[] = [
      {
        type: "MEDLEMSKAPSPERIODE",
        id: 1,
        fomDato: "",
        tomDato: "30.06.2023",
        bestemmelse: "FTRL_2_7",
        innvilgelsesResultat: "INNVILGET",
        trygdedekning: "FULL_DEKNING",
        medlemskapstype: "PLIKTIG",
        redigerbar: false,
      },
      {
        type: "MEDLEMSKAPSPERIODE",
        id: 2,
        fomDato: "01.07.2023",
        tomDato: "31.12.2023",
        bestemmelse: "FTRL_2_8",
        innvilgelsesResultat: "INNVILGET",
        trygdedekning: "DELVIS_DEKNING",
        medlemskapstype: "PLIKTIG",
      },
    ];

    const result = finnMedlemskapsperiode(perioder);

    expect(result).toEqual({
      fomDato: "01.07.2023",
      tomDato: "31.12.2023",
    });
  });

  it("skal filtrere bort perioder uten tomDato", () => {
    const perioder: Avgiftspliktigperiode[] = [
      {
        type: "MEDLEMSKAPSPERIODE",
        id: 1,
        fomDato: "01.01.2023",
        tomDato: "30.06.2023",
        bestemmelse: "FTRL_2_7",
        innvilgelsesResultat: "INNVILGET",
        trygdedekning: "FULL_DEKNING",
        medlemskapstype: "PLIKTIG",
        redigerbar: false,
      },
      {
        type: "MEDLEMSKAPSPERIODE",
        id: 2,
        fomDato: "01.07.2023",
        tomDato: "",
        bestemmelse: "FTRL_2_8",
        innvilgelsesResultat: "INNVILGET",
        trygdedekning: "DELVIS_DEKNING",
        medlemskapstype: "PLIKTIG",
        redigerbar: false,
      },
    ];

    const result = finnMedlemskapsperiode(perioder);

    expect(result).toEqual({
      fomDato: "01.01.2023",
      tomDato: "30.06.2023",
    });
  });

  it("skal returnere undefined når alle perioder mangler fom eller tom", () => {
    const perioder: Avgiftspliktigperiode[] = [
      {
        type: "MEDLEMSKAPSPERIODE",
        id: 1,
        fomDato: "",
        tomDato: "30.06.2023",
        bestemmelse: "FTRL_2_7",
        innvilgelsesResultat: "INNVILGET",
        trygdedekning: "FULL_DEKNING",
        medlemskapstype: "PLIKTIG",
        redigerbar: false,
      },
      {
        type: "MEDLEMSKAPSPERIODE",
        id: 2,
        fomDato: "01.07.2023",
        tomDato: "",
        bestemmelse: "FTRL_2_8",
        innvilgelsesResultat: "INNVILGET",
        trygdedekning: "DELVIS_DEKNING",
        medlemskapstype: "PLIKTIG",
        redigerbar: false,
      },
    ];

    const result = finnMedlemskapsperiode(perioder);

    expect(result).toBeUndefined();
  });

  it("skal håndtere én enkelt periode", () => {
    const perioder: Avgiftspliktigperiode[] = [
      {
        type: "MEDLEMSKAPSPERIODE",
        id: 1,
        fomDato: "01.01.2023",
        tomDato: "31.12.2023",
        bestemmelse: "FTRL_2_7",
        innvilgelsesResultat: "INNVILGET",
        trygdedekning: "FULL_DEKNING",
        medlemskapstype: "PLIKTIG",
        redigerbar: false,
      },
    ];

    const result = finnMedlemskapsperiode(perioder);

    expect(result).toEqual({
      fomDato: "01.01.2023",
      tomDato: "31.12.2023",
    });
  });

  it("skal sortere perioder korrekt og ta første fomDato og siste tomDato", () => {
    const perioder: Avgiftspliktigperiode[] = [
      {
        type: "MEDLEMSKAPSPERIODE",
        id: 2,
        fomDato: "01.07.2023",
        tomDato: "31.12.2023",
        bestemmelse: "FTRL_2_8",
        innvilgelsesResultat: "INNVILGET",
        trygdedekning: "DELVIS_DEKNING",
        medlemskapstype: "PLIKTIG",
        redigerbar: false,
      },
      {
        type: "MEDLEMSKAPSPERIODE",
        id: 1,
        fomDato: "01.01.2023",
        tomDato: "30.06.2023",
        bestemmelse: "FTRL_2_7",
        innvilgelsesResultat: "INNVILGET",
        trygdedekning: "FULL_DEKNING",
        medlemskapstype: "PLIKTIG",
        redigerbar: false,
      },
      {
        type: "MEDLEMSKAPSPERIODE",
        id: 3,
        fomDato: "01.01.2024",
        tomDato: "30.06.2024",
        bestemmelse: "FTRL_2_7",
        innvilgelsesResultat: "INNVILGET",
        trygdedekning: "FULL_DEKNING",
        medlemskapstype: "PLIKTIG",
        redigerbar: false,
      },
    ];

    const result = finnMedlemskapsperiode(perioder);

    // Skal sortere og ta første fomDato (01.01.2023) og siste tomDato (30.06.2024)
    expect(result).toEqual({
      fomDato: "01.01.2023",
      tomDato: "30.06.2024",
    });
  });
});
