import { yupResolver } from "@hookform/resolvers/yup";
import { render, renderHook, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { useForm } from "react-hook-form";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import aarsavregningMedGrunnlagSchema from "./aarsavregningMedGrunnlagSchema";
import { AarsavregningMedGrunnlagForm } from "./aarsavregningMedGrunnlagForm";
import MKV from "../../../../../melosyskodeverk";
import { Avgiftspliktigperiode } from "../../../../../services/modules/types/periodeTyper";
import { finnMedlemskapsperiode } from "../utils";
import behandlingerReducer from "../../../../../ducks/behandlinger";
import behandlingsresultatReducer from "../../../../../ducks/behandlingsresultat";

const { MANUELL_ENDELIG_AVGIFT, OPPLYSNINGER_ENDRET } = MKV.Koder.endeligAvgiftValg;

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

describe("AarsavregningMedGrunnlagForm ny vurdering uten avgiftspliktige perioder", () => {
  it("skal skjule skjemaet, markere steget som gyldig og vise sumtabellen", async () => {
    const store = configureStore({
      reducer: {
        behandlinger: behandlingerReducer,
        behandlingsresultat: behandlingsresultatReducer,
      } as const,
      preloadedState: {
        behandlinger: {
          data: {
            behandlingID: 123,
            redigerbart: true,
          },
          status: "OK",
        },
        behandlingsresultat: {
          data: {
            aarsavregningID: 456,
          },
          status: "OK",
        },
      },
    });

    const oppdaterStatus = vi.fn();

    render(
      <Provider store={store}>
        <AarsavregningMedGrunnlagForm
          bekreft={vi.fn()}
          oppdaterStatus={oppdaterStatus}
          initiellData={{
            aarsavregningResponse: {
              aarsavregningID: 456,
              aar: 2024,
              endeligAvgiftValg: OPPLYSNINGER_ENDRET,
              sisteGjeldendeAvgiftspliktigperioder: [],
              nyttTrygdeavgiftsGrunnlag: undefined,
              tidligereTrygdeavgiftsGrunnlagsopplysninger: {
                trygdeavgiftsgrunnlag: {
                  avgiftspliktigperioder: [],
                  skatteforholdsperioder: [],
                  inntektskperioder: [],
                },
                avgift: {
                  trygdeavgiftsperioder: [],
                  totalInntekt: 0,
                  totalAvgift: 0,
                },
              },
              avregning: {
                beregnetAvgiftBelop: 12000,
                tidligereFakturertBeloep: 8000,
              },
            },
            formDefaultValues: {
              skatteforholdsperioder: [],
              inntektskilder: [],
              endeligAvgiftValg: OPPLYSNINGER_ENDRET,
              manueltAvgiftBeloep: "",
            },
            innvilgetMedlemskapsperioder: [],
            medlemskapstypeErPliktig: false,
            forrigeÅrsavregningErManueltBeregnet: false,
            valgtÅr: 2024,
          }}
        />
      </Provider>,
    );

    expect(screen.queryByText("Inntekts- og skatteopplysninger for endelig trygdeavgift")).not.toBeInTheDocument();

    await waitFor(() => {
      expect(oppdaterStatus).toHaveBeenLastCalledWith(true);
    });

    expect(screen.getByRole("cell", { name: "Endelig beregnet trygdeavgift" })).toBeInTheDocument();
    expect(screen.getByText("Tidligere beregnet trygdeavgift")).toBeInTheDocument();
    expect(screen.getByText("Differanse")).toBeInTheDocument();
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
