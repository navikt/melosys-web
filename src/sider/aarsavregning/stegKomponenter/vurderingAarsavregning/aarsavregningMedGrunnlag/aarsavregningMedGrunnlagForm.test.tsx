import { yupResolver } from "@hookform/resolvers/yup";
import { renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { useForm } from "react-hook-form";
import aarsavregningMedGrunnlagSchema from "./aarsavregningMedGrunnlagSchema";
import MKV from "../../../../../melosyskodeverk";

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
