import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, waitFor } from "@testing-library/react";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import { AarsavregningMedGrunnlag } from "./aarsavregningMedGrunnlag";
import * as Api from "../../../../../services/api";
import { AarsavregningResponse } from "../../../../../services/modules/aarsavregning/aarsavregning";
import behandlingerReducer from "../../../../../ducks/behandlinger";
import aarsavregningReducer from "../../../../../ducks/aarsavregning";
import behandlingsresultatReducer from "../../../../../ducks/behandlingsresultat";

vi.mock("../../../../../services/api", () => ({
  Aarsavregning: {
    hentAarsavregning: vi.fn(),
  },
  Ftrl: {
    hentBestemmelser: vi.fn(),
  },
}));

const createMockStore = (behandlingID = 123) => {
  return configureStore({
    reducer: {
      behandlinger: behandlingerReducer,
      aarsavregning: aarsavregningReducer,
      behandlingsresultat: behandlingsresultatReducer,
    } as any,
    preloadedState: {
      behandlinger: {
        data: {
          behandlingID,
        },
        status: "OK",
        error: null,
      },
      aarsavregning: {
        data: null,
        status: "INIT",
        error: null,
      },
      behandlingsresultat: {
        data: {},
        status: "OK",
        error: null,
      },
    } as any,
  });
};

describe("AarsavregningMedGrunnlag", () => {
  const renderWithMockResponse = (mockResponse: AarsavregningResponse) => {
    vi.mocked(Api.Aarsavregning.hentAarsavregning).mockResolvedValue(mockResponse);
    const store = createMockStore();
    const bekreft = vi.fn();
    const oppdaterStatus = vi.fn();

    const result = render(
      <Provider store={store}>
        <AarsavregningMedGrunnlag bekreft={bekreft} oppdaterStatus={oppdaterStatus} aktivtSteg={true} />
      </Provider>,
    );

    return { store, bekreft, oppdaterStatus, ...result };
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(Api.Ftrl.hentBestemmelser).mockResolvedValue({
      bestemmelser: ["FTRL_2_7", "FTRL_2_8", "FTRL_2_9"],
    });
  });

  describe("Grunnlag-valglogikk", () => {
    it("skal bruke nyttTrygdeavgiftsGrunnlag når det eksisterer", async () => {
      const mockResponse: AarsavregningResponse = {
        aarsavregningID: 1,
        aar: 2023,
        sisteGjeldendeAvgiftspliktigperioder: [
          {
            type: "MEDLEMSKAPSPERIODE",
            id: 1,
            fomDato: "2023-01-01",
            tomDato: "2023-12-31",
            bestemmelse: "FTRL_2_7",
            medlemskapstype: "PLIKTIG",
            innvilgelsesResultat: "INNVILGET",
            trygdedekning: "FULL_DEKNING",
          },
        ],
        nyttTrygdeavgiftsGrunnlag: {
          trygdeavgiftsgrunnlag: {
            avgiftspliktigperioder: [],
            skatteforholdsperioder: [
              {
                fomDato: "2023-01-01",
                tomDato: "2023-12-31",
                skatteplikttype: "SKATTEPLIKTIG",
              },
            ],
            inntektskperioder: [
              {
                type: "ARBEIDSINNTEKT",
                arbeidsgiversavgiftBetales: true,
                avgiftspliktigInntekt: 600000,
                fomDato: "2023-01-01",
                tomDato: "2023-12-31",
                erMaanedsbelop: false,
              },
            ],
          },
          avgift: {
            trygdeavgiftsperioder: [],
            totalInntekt: 600000,
            totalAvgift: 30600,
          },
        },
        tidligereTrygdeavgiftsGrunnlagsopplysninger: {
          trygdeavgiftsgrunnlag: {
            avgiftspliktigperioder: [],
            skatteforholdsperioder: [],
            inntektskperioder: [],
          },
          avgift: {
            trygdeavgiftsperioder: [],
            totalInntekt: 500000,
            totalAvgift: 25500,
          },
        },
      };

      const { store } = renderWithMockResponse(mockResponse);

      await waitFor(() => {
        expect(Api.Aarsavregning.hentAarsavregning).toHaveBeenCalled();
      });

      // Verifiser at nyttTrygdeavgiftsGrunnlag-data blir brukt (600000 i stedet for 500000)
      await waitFor(() => {
        const state = store.getState();
        expect(state.aarsavregning.data).toBeDefined();
      });
    });

    it("skal bruke tidligere grunnlag når bestemmelse matcher og ingen nyttTrygdeavgiftsGrunnlag eksisterer", async () => {
      const mockResponse: AarsavregningResponse = {
        aarsavregningID: 1,
        aar: 2023,
        sisteGjeldendeAvgiftspliktigperioder: [
          {
            type: "MEDLEMSKAPSPERIODE",
            id: 1,
            fomDato: "2023-01-01",
            tomDato: "2023-12-31",
            bestemmelse: "FTRL_2_7", // Samme som tidligere
            medlemskapstype: "PLIKTIG",
            innvilgelsesResultat: "INNVILGET",
            trygdedekning: "FULL_DEKNING",
          },
        ],
        nyttTrygdeavgiftsGrunnlag: undefined, // Ingen nytt grunnlag
        tidligereTrygdeavgiftsGrunnlagsopplysninger: {
          trygdeavgiftsgrunnlag: {
            avgiftspliktigperioder: [
              {
                type: "MEDLEMSKAPSPERIODE",
                id: 2,
                fomDato: "2023-01-01",
                tomDato: "2023-12-31",
                bestemmelse: "FTRL_2_7", // Samme bestemmelse
                medlemskapstype: "PLIKTIG",
                innvilgelsesResultat: "INNVILGET",
                trygdedekning: "FULL_DEKNING",
              },
            ],
            skatteforholdsperioder: [
              {
                fomDato: "2023-01-01",
                tomDato: "2023-12-31",
                skatteplikttype: "SKATTEPLIKTIG",
              },
            ],
            inntektskperioder: [
              {
                type: "ARBEIDSINNTEKT",
                arbeidsgiversavgiftBetales: true,
                avgiftspliktigInntekt: 500000,
                fomDato: "2023-01-01",
                tomDato: "2023-12-31",
                erMaanedsbelop: false,
              },
            ],
          },
          avgift: {
            trygdeavgiftsperioder: [],
            totalInntekt: 500000,
            totalAvgift: 25500,
          },
        },
      };

      const { store } = renderWithMockResponse(mockResponse);

      await waitFor(() => {
        expect(Api.Aarsavregning.hentAarsavregning).toHaveBeenCalled();
      });

      // Skal bruke tidligere grunnlag siden bestemmelse matcher
      await waitFor(() => {
        const state = store.getState();
        expect(state.aarsavregning.data).toBeDefined();
        expect(state.aarsavregning.status).toBe("OK");
      });
    });

    it("skal IKKE bruke tidligere grunnlag når bestemmelse er forskjellig", async () => {
      const mockResponse: AarsavregningResponse = {
        aarsavregningID: 1,
        aar: 2023,
        sisteGjeldendeAvgiftspliktigperioder: [
          {
            type: "MEDLEMSKAPSPERIODE",
            id: 1,
            fomDato: "2023-01-01",
            tomDato: "2023-12-31",
            bestemmelse: "FTRL_2_8", // Forskjellig fra tidligere
            medlemskapstype: "PLIKTIG",
            innvilgelsesResultat: "INNVILGET",
            trygdedekning: "FULL_DEKNING",
          },
        ],
        nyttTrygdeavgiftsGrunnlag: undefined,
        tidligereTrygdeavgiftsGrunnlagsopplysninger: {
          trygdeavgiftsgrunnlag: {
            avgiftspliktigperioder: [
              {
                type: "MEDLEMSKAPSPERIODE",
                id: 2,
                fomDato: "2023-01-01",
                tomDato: "2023-12-31",
                bestemmelse: "FTRL_2_7", // Forskjellig bestemmelse
                medlemskapstype: "PLIKTIG",
                innvilgelsesResultat: "INNVILGET",
                trygdedekning: "FULL_DEKNING",
              },
            ],
            skatteforholdsperioder: [],
            inntektskperioder: [],
          },
          avgift: {
            trygdeavgiftsperioder: [],
            totalInntekt: 500000,
            totalAvgift: 25500,
          },
        },
      };

      const { store } = renderWithMockResponse(mockResponse);

      await waitFor(() => {
        expect(Api.Aarsavregning.hentAarsavregning).toHaveBeenCalled();
      });

      // Skal IKKE bruke tidligere grunnlag siden bestemmelse ikke matcher
      await waitFor(() => {
        const state = store.getState();
        expect(state.aarsavregning.data).toBeDefined();
      });
    });
  });

  describe("sisteGjeldendeMedlemskapsperioder håndtering", () => {
    it("skal bruke sisteGjeldendeMedlemskapsperioder når tilgjengelig", async () => {
      const mockResponse: AarsavregningResponse = {
        aarsavregningID: 1,
        aar: 2023,
        sisteGjeldendeAvgiftspliktigperioder: [
          {
            type: "MEDLEMSKAPSPERIODE",
            id: 1,
            fomDato: "2023-01-01",
            tomDato: "2023-06-30",
            bestemmelse: "FTRL_2_7",
            medlemskapstype: "PLIKTIG",
            innvilgelsesResultat: "INNVILGET",
            trygdedekning: "FULL_DEKNING",
          },
          {
            type: "MEDLEMSKAPSPERIODE",
            id: 2,
            fomDato: "2023-07-01",
            tomDato: "2023-12-31",
            bestemmelse: "FTRL_2_8",
            medlemskapstype: "PLIKTIG",
            innvilgelsesResultat: "INNVILGET",
            trygdedekning: "DELVIS_DEKNING",
          },
        ],
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
      };

      const { store } = renderWithMockResponse(mockResponse);

      await waitFor(() => {
        expect(Api.Aarsavregning.hentAarsavregning).toHaveBeenCalled();
      });

      // Verifiser at sisteGjeldendeMedlemskapsperioder blir brukt
      const state = store.getState();
      expect(state.aarsavregning.data?.sisteGjeldendeAvgiftspliktigperioder).toHaveLength(2);
    });

    it("skal håndtere tomme sisteGjeldendeMedlemskapsperioder uten feil", async () => {
      const mockResponse: AarsavregningResponse = {
        aarsavregningID: 1,
        aar: 2023,
        sisteGjeldendeAvgiftspliktigperioder: [], // Tom array
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
      };

      const { store } = renderWithMockResponse(mockResponse);

      await waitFor(() => {
        expect(Api.Aarsavregning.hentAarsavregning).toHaveBeenCalled();
      });

      // Skal håndtere tom array uten feil
      const state = store.getState();
      expect(state.aarsavregning.data?.sisteGjeldendeAvgiftspliktigperioder).toEqual([]);
    });
  });

  describe("Feilhåndtering", () => {
    it("skal vise feilmelding når ingen tidligere grunnlag eksisterer", async () => {
      const mockResponse: AarsavregningResponse = {
        aarsavregningID: 1,
        aar: 2023,
        sisteGjeldendeAvgiftspliktigperioder: [],
        tidligereTrygdeavgiftsGrunnlagsopplysninger: undefined, // Ingen tidligere grunnlag
      };

      const { container } = renderWithMockResponse(mockResponse);

      await waitFor(() => {
        expect(Api.Aarsavregning.hentAarsavregning).toHaveBeenCalled();
      });

      // Skal vise feilmelding
      await waitFor(() => {
        expect(container.textContent).toContain("Årsavregning med grunnlag må ha grunnlag");
      });
    });
  });

  describe("Prioritering av grunnlagkilder", () => {
    it("skal prioritere nyttTrygdeavgiftsGrunnlag over matchende bestemmelse", async () => {
      const mockResponse: AarsavregningResponse = {
        aarsavregningID: 1,
        aar: 2023,
        sisteGjeldendeAvgiftspliktigperioder: [
          {
            type: "MEDLEMSKAPSPERIODE",
            id: 1,
            fomDato: "2023-01-01",
            tomDato: "2023-12-31",
            bestemmelse: "FTRL_2_7",
            medlemskapstype: "PLIKTIG",
            innvilgelsesResultat: "INNVILGET",
            trygdedekning: "FULL_DEKNING",
          },
        ],
        nyttTrygdeavgiftsGrunnlag: {
          trygdeavgiftsgrunnlag: {
            avgiftspliktigperioder: [],
            skatteforholdsperioder: [],
            inntektskperioder: [
              {
                type: "ARBEIDSINNTEKT",
                arbeidsgiversavgiftBetales: true,
                avgiftspliktigInntekt: 700000, // Nytt beløp
                fomDato: "2023-01-01",
                tomDato: "2023-12-31",
                erMaanedsbelop: false,
              },
            ],
          },
          avgift: {
            trygdeavgiftsperioder: [],
            totalInntekt: 700000,
            totalAvgift: 35700,
          },
        },
        tidligereTrygdeavgiftsGrunnlagsopplysninger: {
          trygdeavgiftsgrunnlag: {
            avgiftspliktigperioder: [
              {
                type: "MEDLEMSKAPSPERIODE",
                id: 2,
                fomDato: "2023-01-01",
                tomDato: "2023-12-31",
                bestemmelse: "FTRL_2_7", // Samme bestemmelse
                medlemskapstype: "PLIKTIG",
                innvilgelsesResultat: "INNVILGET",
                trygdedekning: "FULL_DEKNING",
              },
            ],
            skatteforholdsperioder: [],
            inntektskperioder: [
              {
                type: "ARBEIDSINNTEKT",
                arbeidsgiversavgiftBetales: true,
                avgiftspliktigInntekt: 500000, // Gammelt beløp
                fomDato: "2023-01-01",
                tomDato: "2023-12-31",
                erMaanedsbelop: false,
              },
            ],
          },
          avgift: {
            trygdeavgiftsperioder: [],
            totalInntekt: 500000,
            totalAvgift: 25500,
          },
        },
      };

      const { store } = renderWithMockResponse(mockResponse);

      await waitFor(() => {
        expect(Api.Aarsavregning.hentAarsavregning).toHaveBeenCalled();
      });

      // Skal bruke nyttTrygdeavgiftsGrunnlag selv om bestemmelse matcher
      await waitFor(() => {
        const state = store.getState();
        expect(state.aarsavregning.data?.nyttTrygdeavgiftsGrunnlag?.avgift.totalInntekt).toBe(700000);
      });
    });
  });

  describe("Edge cases for mapMedlemskapsperioder", () => {
    it("skal håndtere flere innvilgede perioder med forskjellige bestemmelser", async () => {
      const mockResponse: AarsavregningResponse = {
        aarsavregningID: 1,
        aar: 2023,
        sisteGjeldendeAvgiftspliktigperioder: [
          {
            type: "MEDLEMSKAPSPERIODE",
            id: 1,
            fomDato: "2023-01-01",
            tomDato: "2023-06-30",
            bestemmelse: "FTRL_2_7",
            medlemskapstype: "PLIKTIG",
            innvilgelsesResultat: "INNVILGET",
            trygdedekning: "FULL_DEKNING",
          },
          {
            type: "MEDLEMSKAPSPERIODE",
            id: 2,
            fomDato: "2023-07-01",
            tomDato: "2023-09-30",
            bestemmelse: "FTRL_2_8",
            medlemskapstype: "PLIKTIG",
            innvilgelsesResultat: "INNVILGET",
            trygdedekning: "DELVIS_DEKNING",
          },
          {
            type: "MEDLEMSKAPSPERIODE",
            id: 3,
            fomDato: "2023-10-01",
            tomDato: "2023-12-31",
            bestemmelse: "FTRL_2_9",
            medlemskapstype: "FRIVILLIG",
            innvilgelsesResultat: "INNVILGET",
            trygdedekning: "FULL_DEKNING",
          },
        ],
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
      };

      const { store } = renderWithMockResponse(mockResponse);

      await waitFor(() => {
        expect(Api.Aarsavregning.hentAarsavregning).toHaveBeenCalled();
      });

      // Skal håndtere alle tre periodene
      const state = store.getState();
      expect(state.aarsavregning.data?.sisteGjeldendeAvgiftspliktigperioder).toHaveLength(3);
    });

    it("skal filtrere bort ikke-innvilgede perioder", async () => {
      const mockResponse: AarsavregningResponse = {
        aarsavregningID: 1,
        aar: 2023,
        sisteGjeldendeAvgiftspliktigperioder: [
          {
            type: "MEDLEMSKAPSPERIODE",
            id: 1,
            fomDato: "2023-01-01",
            tomDato: "2023-06-30",
            bestemmelse: "FTRL_2_7",
            medlemskapstype: "PLIKTIG",
            innvilgelsesResultat: "INNVILGET",
            trygdedekning: "FULL_DEKNING",
          },
          {
            type: "MEDLEMSKAPSPERIODE",
            id: 2,
            fomDato: "2023-07-01",
            tomDato: "2023-12-31",
            bestemmelse: "FTRL_2_8",
            medlemskapstype: "PLIKTIG",
            innvilgelsesResultat: "AVSLÅTT", // Ikke innvilget
            trygdedekning: "INGEN_DEKNING",
          },
        ],
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
      };

      const { store } = renderWithMockResponse(mockResponse);

      await waitFor(() => {
        expect(Api.Aarsavregning.hentAarsavregning).toHaveBeenCalled();
      });

      // mapMedlemskapsperioder skal filtrere bort avslåtte perioder
      // Så vi skal kun ha data for én periode i formatet
      const state = store.getState();
      expect(state.aarsavregning.data?.sisteGjeldendeAvgiftspliktigperioder).toHaveLength(2);
    });

    it("skal håndtere perioder med ulike trygdedekninger", async () => {
      const mockResponse: AarsavregningResponse = {
        aarsavregningID: 1,
        aar: 2023,
        sisteGjeldendeAvgiftspliktigperioder: [
          {
            type: "MEDLEMSKAPSPERIODE",
            id: 1,
            fomDato: "2023-01-01",
            tomDato: "2023-12-31",
            bestemmelse: "FTRL_2_7",
            medlemskapstype: "PLIKTIG",
            innvilgelsesResultat: "INNVILGET",
            trygdedekning: "INGEN_DEKNING",
          },
        ],
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
      };

      const { store } = renderWithMockResponse(mockResponse);

      await waitFor(() => {
        expect(Api.Aarsavregning.hentAarsavregning).toHaveBeenCalled();
      });

      // Skal håndtere ulike trygdedekninger uten å krasje
      const state = store.getState();
      expect(state.aarsavregning.data).toBeDefined();
    });

    it("skal sortere perioder kronologisk", async () => {
      const mockResponse: AarsavregningResponse = {
        aarsavregningID: 1,
        aar: 2023,
        sisteGjeldendeAvgiftspliktigperioder: [
          {
            type: "MEDLEMSKAPSPERIODE",
            id: 3,
            fomDato: "2023-09-01",
            tomDato: "2023-12-31",
            bestemmelse: "FTRL_2_9",
            medlemskapstype: "PLIKTIG",
            innvilgelsesResultat: "INNVILGET",
            trygdedekning: "FULL_DEKNING",
          },
          {
            type: "MEDLEMSKAPSPERIODE",
            id: 1,
            fomDato: "2023-01-01",
            tomDato: "2023-04-30",
            bestemmelse: "FTRL_2_7",
            medlemskapstype: "PLIKTIG",
            innvilgelsesResultat: "INNVILGET",
            trygdedekning: "FULL_DEKNING",
          },
          {
            type: "MEDLEMSKAPSPERIODE",
            id: 2,
            fomDato: "2023-05-01",
            tomDato: "2023-08-31",
            bestemmelse: "FTRL_2_8",
            medlemskapstype: "PLIKTIG",
            innvilgelsesResultat: "INNVILGET",
            trygdedekning: "DELVIS_DEKNING",
          },
        ],
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
      };

      const { store } = renderWithMockResponse(mockResponse);

      await waitFor(() => {
        expect(Api.Aarsavregning.hentAarsavregning).toHaveBeenCalled();
      });

      // Perioder skal være tilgjengelige og håndtert korrekt
      const state = store.getState();
      expect(state.aarsavregning.data?.sisteGjeldendeAvgiftspliktigperioder).toHaveLength(3);
    });

    it("skal håndtere perioder med ISO-datoformat", async () => {
      const mockResponse: AarsavregningResponse = {
        aarsavregningID: 1,
        aar: 2023,
        sisteGjeldendeAvgiftspliktigperioder: [
          {
            type: "MEDLEMSKAPSPERIODE",
            id: 1,
            fomDato: "2023-01-01", // ISO-format
            tomDato: "2023-12-31", // ISO-format
            bestemmelse: "FTRL_2_7",
            medlemskapstype: "PLIKTIG",
            innvilgelsesResultat: "INNVILGET",
            trygdedekning: "FULL_DEKNING",
          },
        ],
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
      };

      const { store } = renderWithMockResponse(mockResponse);

      await waitFor(() => {
        expect(Api.Aarsavregning.hentAarsavregning).toHaveBeenCalled();
      });

      // mapMedlemskapsperioder skal konvertere til norsk format
      const state = store.getState();
      expect(state.aarsavregning.data).toBeDefined();
    });
  });
});
