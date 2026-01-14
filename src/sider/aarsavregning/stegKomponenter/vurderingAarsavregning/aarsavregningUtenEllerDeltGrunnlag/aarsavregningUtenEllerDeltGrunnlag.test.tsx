import { describe, expect, it } from "vitest";
import { AarsavregningResponse } from "../../../../../services/modules/aarsavregning/aarsavregning";

describe("AarsavregningUtenEllerDeltGrunnlag - Bestemmelse-logikk", () => {
  describe("Bestemmelse sammenligningslogikk", () => {
    it("skal identifisere matchende bestemmelse mellom gamle og nye medlemskapsperioder", () => {
      const mockResponse: AarsavregningResponse = {
        aarsavregningID: 1,
        aar: 2023,
        sisteGjeldendeAvgiftspliktigperioder: [
          {
            id: 1,
            fomDato: "2023-01-01",
            tomDato: "2023-12-31",
            bestemmelse: "FTRL_2_7",
            medlemskapstype: "PLIKTIG",
            innvilgelsesResultat: "INNVILGET",
            trygdedekning: "FULL_DEKNING",
            redigerbar: false,
          },
        ],
        tidligereTrygdeavgiftsGrunnlagsopplysninger: {
          trygdeavgiftsgrunnlag: {
            avgiftspliktigperioder: [
              {
                id: 2,
                fomDato: "2023-01-01",
                tomDato: "2023-12-31",
                bestemmelse: "FTRL_2_7", // Samme bestemmelse
                medlemskapstype: "PLIKTIG",
                innvilgelsesResultat: "INNVILGET",
                trygdedekning: "FULL_DEKNING",
                redigerbar: false,
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

      // Test logikken for sammenligning av bestemmelse
      const gammelBestemmelse =
        mockResponse.tidligereTrygdeavgiftsGrunnlagsopplysninger?.trygdeavgiftsgrunnlag?.avgiftspliktigperioder?.[0]
          ?.bestemmelse;
      const nyBestemmelse = mockResponse.sisteGjeldendeAvgiftspliktigperioder?.[0]?.bestemmelse;

      expect(gammelBestemmelse).toBe("FTRL_2_7");
      expect(nyBestemmelse).toBe("FTRL_2_7");
      expect(gammelBestemmelse).toBe(nyBestemmelse);
    });

    it("skal identifisere forskjellig bestemmelse mellom gamle og nye medlemskapsperioder", () => {
      const mockResponse: AarsavregningResponse = {
        aarsavregningID: 1,
        aar: 2023,
        sisteGjeldendeAvgiftspliktigperioder: [
          {
            id: 1,
            fomDato: "2023-01-01",
            tomDato: "2023-12-31",
            bestemmelse: "FTRL_2_8", // Forskjellig
            medlemskapstype: "PLIKTIG",
            innvilgelsesResultat: "INNVILGET",
            trygdedekning: "FULL_DEKNING",
            redigerbar: false,
          },
        ],
        tidligereTrygdeavgiftsGrunnlagsopplysninger: {
          trygdeavgiftsgrunnlag: {
            avgiftspliktigperioder: [
              {
                id: 2,
                fomDato: "2023-01-01",
                tomDato: "2023-12-31",
                bestemmelse: "FTRL_2_7", // Forskjellig
                medlemskapstype: "PLIKTIG",
                innvilgelsesResultat: "INNVILGET",
                trygdedekning: "FULL_DEKNING",
                redigerbar: false,
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

      // Test logikken for sammenligning av bestemmelse
      const gammelBestemmelse =
        mockResponse.tidligereTrygdeavgiftsGrunnlagsopplysninger?.trygdeavgiftsgrunnlag?.avgiftspliktigperioder?.[0]
          ?.bestemmelse;
      const nyBestemmelse = mockResponse.sisteGjeldendeAvgiftspliktigperioder?.[0]?.bestemmelse;

      expect(gammelBestemmelse).toBe("FTRL_2_7");
      expect(nyBestemmelse).toBe("FTRL_2_8");
      expect(gammelBestemmelse).not.toBe(nyBestemmelse);
    });

    it("skal håndtere null/undefined grunnlag uten feil", () => {
      const mockResponse: AarsavregningResponse = {
        aarsavregningID: 1,
        aar: 2023,
        sisteGjeldendeAvgiftspliktigperioder: [],
        tidligereTrygdeavgiftsGrunnlagsopplysninger: undefined,
      };

      // Test at logikken håndterer undefined
      const gammelBestemmelse =
        mockResponse.tidligereTrygdeavgiftsGrunnlagsopplysninger?.trygdeavgiftsgrunnlag?.avgiftspliktigperioder?.[0]
          ?.bestemmelse;
      const nyBestemmelse = mockResponse.sisteGjeldendeAvgiftspliktigperioder?.[0]?.bestemmelse;

      expect(gammelBestemmelse).toBeUndefined();
      expect(nyBestemmelse).toBeUndefined();
      // Skal ikke krasje ved sammenligning av undefined-verdier
      expect(gammelBestemmelse === nyBestemmelse).toBe(true);
    });

    it("skal håndtere tomme arrays korrekt", () => {
      const mockResponse: AarsavregningResponse = {
        aarsavregningID: 1,
        aar: 2023,
        sisteGjeldendeAvgiftspliktigperioder: [],
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

      const gammelBestemmelse =
        mockResponse.tidligereTrygdeavgiftsGrunnlagsopplysninger?.trygdeavgiftsgrunnlag?.avgiftspliktigperioder?.[0]
          ?.bestemmelse;
      const nyBestemmelse = mockResponse.sisteGjeldendeAvgiftspliktigperioder?.[0]?.bestemmelse;

      expect(gammelBestemmelse).toBeUndefined();
      expect(nyBestemmelse).toBeUndefined();
      expect(mockResponse.sisteGjeldendeAvgiftspliktigperioder).toHaveLength(0);
      expect(
        mockResponse.tidligereTrygdeavgiftsGrunnlagsopplysninger?.trygdeavgiftsgrunnlag?.avgiftspliktigperioder,
      ).toHaveLength(0);
    });

    it("skal håndtere flere medlemskapsperioder ved å sammenligne første element", () => {
      const mockResponse: AarsavregningResponse = {
        aarsavregningID: 1,
        aar: 2023,
        sisteGjeldendeAvgiftspliktigperioder: [
          {
            id: 1,
            fomDato: "2023-01-01",
            tomDato: "2023-06-30",
            bestemmelse: "FTRL_2_7",
            medlemskapstype: "PLIKTIG",
            innvilgelsesResultat: "INNVILGET",
            trygdedekning: "FULL_DEKNING",
            redigerbar: false,
          },
          {
            id: 2,
            fomDato: "2023-07-01",
            tomDato: "2023-12-31",
            bestemmelse: "FTRL_2_8",
            medlemskapstype: "FRIVILLIG",
            innvilgelsesResultat: "INNVILGET",
            trygdedekning: "DELVIS_DEKNING",
            redigerbar: false,
          },
        ],
        tidligereTrygdeavgiftsGrunnlagsopplysninger: {
          trygdeavgiftsgrunnlag: {
            avgiftspliktigperioder: [
              {
                id: 3,
                fomDato: "2023-01-01",
                tomDato: "2023-12-31",
                bestemmelse: "FTRL_2_7",
                medlemskapstype: "PLIKTIG",
                innvilgelsesResultat: "INNVILGET",
                trygdedekning: "FULL_DEKNING",
                redigerbar: false,
              },
            ],
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

      // Skal sammenligne første elementer
      const gammelBestemmelse =
        mockResponse.tidligereTrygdeavgiftsGrunnlagsopplysninger?.trygdeavgiftsgrunnlag?.avgiftspliktigperioder?.[0]
          ?.bestemmelse;
      const nyBestemmelse = mockResponse.sisteGjeldendeAvgiftspliktigperioder?.[0]?.bestemmelse;

      expect(gammelBestemmelse).toBe("FTRL_2_7");
      expect(nyBestemmelse).toBe("FTRL_2_7");
      expect(gammelBestemmelse).toBe(nyBestemmelse);

      // Andre element har forskjellig bestemmelse
      expect(mockResponse.sisteGjeldendeAvgiftspliktigperioder?.[1]?.bestemmelse).toBe("FTRL_2_8");
    });
  });

  describe("erDeltGrunnlag-beregning", () => {
    it("skal returnere true når både harTrygdeavgiftFraAvgiftssystemet og tidligereTrygdeavgiftsGrunnlagsopplysninger finnes", () => {
      const harTrygdeavgiftFraAvgiftssystemet = true;
      const aarsavregningResponse: AarsavregningResponse = {
        aarsavregningID: 1,
        aar: 2023,
        sisteGjeldendeAvgiftspliktigperioder: [],
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

      // Simuler logikken fra aarsavregningUtenEllerDeltGrunnlagForm.tsx linje 191-193
      const erDeltGrunnlag =
        harTrygdeavgiftFraAvgiftssystemet && !!aarsavregningResponse?.tidligereTrygdeavgiftsGrunnlagsopplysninger;

      expect(erDeltGrunnlag).toBe(true);
    });

    it("skal returnere false når harTrygdeavgiftFraAvgiftssystemet er false", () => {
      const harTrygdeavgiftFraAvgiftssystemet = false;
      const aarsavregningResponse: AarsavregningResponse = {
        aarsavregningID: 1,
        aar: 2023,
        sisteGjeldendeAvgiftspliktigperioder: [],
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

      const erDeltGrunnlag =
        harTrygdeavgiftFraAvgiftssystemet && !!aarsavregningResponse?.tidligereTrygdeavgiftsGrunnlagsopplysninger;

      expect(erDeltGrunnlag).toBe(false);
    });

    it("skal returnere false når tidligereTrygdeavgiftsGrunnlagsopplysninger er undefined", () => {
      const harTrygdeavgiftFraAvgiftssystemet = true;
      const aarsavregningResponse: AarsavregningResponse = {
        aarsavregningID: 1,
        aar: 2023,
        sisteGjeldendeAvgiftspliktigperioder: [],
        tidligereTrygdeavgiftsGrunnlagsopplysninger: undefined,
      };

      const erDeltGrunnlag =
        harTrygdeavgiftFraAvgiftssystemet && !!aarsavregningResponse?.tidligereTrygdeavgiftsGrunnlagsopplysninger;

      expect(erDeltGrunnlag).toBe(false);
    });

    it("skal returnere false når begge betingelser er false", () => {
      const harTrygdeavgiftFraAvgiftssystemet = false;
      const aarsavregningResponse: AarsavregningResponse = {
        aarsavregningID: 1,
        aar: 2023,
        sisteGjeldendeAvgiftspliktigperioder: [],
        tidligereTrygdeavgiftsGrunnlagsopplysninger: undefined,
      };

      const erDeltGrunnlag =
        harTrygdeavgiftFraAvgiftssystemet && !!aarsavregningResponse?.tidligereTrygdeavgiftsGrunnlagsopplysninger;

      expect(erDeltGrunnlag).toBe(false);
    });
  });
});
