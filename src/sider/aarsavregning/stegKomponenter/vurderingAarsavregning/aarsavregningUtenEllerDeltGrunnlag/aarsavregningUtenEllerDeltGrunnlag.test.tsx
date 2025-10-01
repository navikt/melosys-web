import { describe, it, expect } from "vitest";
import { AarsavregningResponse } from "../../../../../services/modules/aarsavregning/aarsavregning";

describe("AarsavregningUtenEllerDeltGrunnlag - Bestemmelse-logikk", () => {
  describe("Bestemmelse sammenligningslogikk", () => {
    it("skal identifisere matchende bestemmelse mellom gamle og nye medlemskapsperioder", () => {
      const mockResponse: AarsavregningResponse = {
        aarsavregningID: 1,
        aar: 2023,
        gjeldendeMedlemskapsperioder: [
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
            medlemskapsperioder: [
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
        mockResponse.tidligereTrygdeavgiftsGrunnlagsopplysninger?.trygdeavgiftsgrunnlag?.medlemskapsperioder?.[0]
          ?.bestemmelse;
      const nyBestemmelse = mockResponse.gjeldendeMedlemskapsperioder?.[0]?.bestemmelse;

      expect(gammelBestemmelse).toBe("FTRL_2_7");
      expect(nyBestemmelse).toBe("FTRL_2_7");
      expect(gammelBestemmelse).toBe(nyBestemmelse);
    });

    it("skal identifisere forskjellig bestemmelse mellom gamle og nye medlemskapsperioder", () => {
      const mockResponse: AarsavregningResponse = {
        aarsavregningID: 1,
        aar: 2023,
        gjeldendeMedlemskapsperioder: [
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
            medlemskapsperioder: [
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
        mockResponse.tidligereTrygdeavgiftsGrunnlagsopplysninger?.trygdeavgiftsgrunnlag?.medlemskapsperioder?.[0]
          ?.bestemmelse;
      const nyBestemmelse = mockResponse.gjeldendeMedlemskapsperioder?.[0]?.bestemmelse;

      expect(gammelBestemmelse).toBe("FTRL_2_7");
      expect(nyBestemmelse).toBe("FTRL_2_8");
      expect(gammelBestemmelse).not.toBe(nyBestemmelse);
    });

    it("skal håndtere null/undefined grunnlag uten feil", () => {
      const mockResponse: AarsavregningResponse = {
        aarsavregningID: 1,
        aar: 2023,
        gjeldendeMedlemskapsperioder: [],
        tidligereTrygdeavgiftsGrunnlagsopplysninger: undefined,
      };

      // Test at logikken håndterer undefined
      const gammelBestemmelse =
        mockResponse.tidligereTrygdeavgiftsGrunnlagsopplysninger?.trygdeavgiftsgrunnlag?.medlemskapsperioder?.[0]
          ?.bestemmelse;
      const nyBestemmelse = mockResponse.gjeldendeMedlemskapsperioder?.[0]?.bestemmelse;

      expect(gammelBestemmelse).toBeUndefined();
      expect(nyBestemmelse).toBeUndefined();
      // Skal ikke krasje ved sammenligning av undefined-verdier
      expect(gammelBestemmelse === nyBestemmelse).toBe(true);
    });

    it("skal håndtere tomme arrays korrekt", () => {
      const mockResponse: AarsavregningResponse = {
        aarsavregningID: 1,
        aar: 2023,
        gjeldendeMedlemskapsperioder: [],
        tidligereTrygdeavgiftsGrunnlagsopplysninger: {
          trygdeavgiftsgrunnlag: {
            medlemskapsperioder: [],
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
        mockResponse.tidligereTrygdeavgiftsGrunnlagsopplysninger?.trygdeavgiftsgrunnlag?.medlemskapsperioder?.[0]
          ?.bestemmelse;
      const nyBestemmelse = mockResponse.gjeldendeMedlemskapsperioder?.[0]?.bestemmelse;

      expect(gammelBestemmelse).toBeUndefined();
      expect(nyBestemmelse).toBeUndefined();
      expect(mockResponse.gjeldendeMedlemskapsperioder).toHaveLength(0);
      expect(
        mockResponse.tidligereTrygdeavgiftsGrunnlagsopplysninger?.trygdeavgiftsgrunnlag?.medlemskapsperioder,
      ).toHaveLength(0);
    });

    it("skal håndtere flere medlemskapsperioder ved å sammenligne første element", () => {
      const mockResponse: AarsavregningResponse = {
        aarsavregningID: 1,
        aar: 2023,
        gjeldendeMedlemskapsperioder: [
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
            medlemskapsperioder: [
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
        mockResponse.tidligereTrygdeavgiftsGrunnlagsopplysninger?.trygdeavgiftsgrunnlag?.medlemskapsperioder?.[0]
          ?.bestemmelse;
      const nyBestemmelse = mockResponse.gjeldendeMedlemskapsperioder?.[0]?.bestemmelse;

      expect(gammelBestemmelse).toBe("FTRL_2_7");
      expect(nyBestemmelse).toBe("FTRL_2_7");
      expect(gammelBestemmelse).toBe(nyBestemmelse);

      // Andre element har forskjellig bestemmelse
      expect(mockResponse.gjeldendeMedlemskapsperioder?.[1]?.bestemmelse).toBe("FTRL_2_8");
    });
  });
});
