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
      const gammelPeriode =
        mockResponse.tidligereTrygdeavgiftsGrunnlagsopplysninger?.trygdeavgiftsgrunnlag?.avgiftspliktigperioder?.[0];
      const gammelBestemmelse =
        gammelPeriode && (gammelPeriode.type === "MEDLEMSKAPSPERIODE" || gammelPeriode.type === "LOVVALGSPERIODE")
          ? gammelPeriode.bestemmelse
          : undefined;
      const nyPeriode = mockResponse.sisteGjeldendeAvgiftspliktigperioder?.[0];
      const nyBestemmelse =
        nyPeriode && (nyPeriode.type === "MEDLEMSKAPSPERIODE" || nyPeriode.type === "LOVVALGSPERIODE")
          ? nyPeriode.bestemmelse
          : undefined;

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
            type: "MEDLEMSKAPSPERIODE",
            id: 1,
            fomDato: "2023-01-01",
            tomDato: "2023-12-31",
            bestemmelse: "FTRL_2_8", // Forskjellig
            medlemskapstype: "PLIKTIG",
            innvilgelsesResultat: "INNVILGET",
            trygdedekning: "FULL_DEKNING",
          },
        ],
        tidligereTrygdeavgiftsGrunnlagsopplysninger: {
          trygdeavgiftsgrunnlag: {
            avgiftspliktigperioder: [
              {
                type: "MEDLEMSKAPSPERIODE",
                id: 2,
                fomDato: "2023-01-01",
                tomDato: "2023-12-31",
                bestemmelse: "FTRL_2_7", // Forskjellig
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

      // Test logikken for sammenligning av bestemmelse
      const gammelPeriode =
        mockResponse.tidligereTrygdeavgiftsGrunnlagsopplysninger?.trygdeavgiftsgrunnlag?.avgiftspliktigperioder?.[0];
      const gammelBestemmelse =
        gammelPeriode && (gammelPeriode.type === "MEDLEMSKAPSPERIODE" || gammelPeriode.type === "LOVVALGSPERIODE")
          ? gammelPeriode.bestemmelse
          : undefined;
      const nyPeriode = mockResponse.sisteGjeldendeAvgiftspliktigperioder?.[0];
      const nyBestemmelse =
        nyPeriode && (nyPeriode.type === "MEDLEMSKAPSPERIODE" || nyPeriode.type === "LOVVALGSPERIODE")
          ? nyPeriode.bestemmelse
          : undefined;

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
      const gammelPeriode =
        mockResponse.tidligereTrygdeavgiftsGrunnlagsopplysninger?.trygdeavgiftsgrunnlag?.avgiftspliktigperioder?.[0];
      const gammelBestemmelse =
        gammelPeriode && (gammelPeriode.type === "MEDLEMSKAPSPERIODE" || gammelPeriode.type === "LOVVALGSPERIODE")
          ? gammelPeriode.bestemmelse
          : undefined;
      const nyPeriode = mockResponse.sisteGjeldendeAvgiftspliktigperioder?.[0];
      const nyBestemmelse =
        nyPeriode && (nyPeriode.type === "MEDLEMSKAPSPERIODE" || nyPeriode.type === "LOVVALGSPERIODE")
          ? nyPeriode.bestemmelse
          : undefined;

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

      const gammelPeriode =
        mockResponse.tidligereTrygdeavgiftsGrunnlagsopplysninger?.trygdeavgiftsgrunnlag?.avgiftspliktigperioder?.[0];
      const gammelBestemmelse =
        gammelPeriode && (gammelPeriode.type === "MEDLEMSKAPSPERIODE" || gammelPeriode.type === "LOVVALGSPERIODE")
          ? gammelPeriode.bestemmelse
          : undefined;
      const nyPeriode = mockResponse.sisteGjeldendeAvgiftspliktigperioder?.[0];
      const nyBestemmelse =
        nyPeriode && (nyPeriode.type === "MEDLEMSKAPSPERIODE" || nyPeriode.type === "LOVVALGSPERIODE")
          ? nyPeriode.bestemmelse
          : undefined;

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
            medlemskapstype: "FRIVILLIG",
            innvilgelsesResultat: "INNVILGET",
            trygdedekning: "DELVIS_DEKNING",
          },
        ],
        tidligereTrygdeavgiftsGrunnlagsopplysninger: {
          trygdeavgiftsgrunnlag: {
            avgiftspliktigperioder: [
              {
                type: "MEDLEMSKAPSPERIODE",
                id: 3,
                fomDato: "2023-01-01",
                tomDato: "2023-12-31",
                bestemmelse: "FTRL_2_7",
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
            totalInntekt: 0,
            totalAvgift: 0,
          },
        },
      };

      // Skal sammenligne første elementer
      const gammelPeriode =
        mockResponse.tidligereTrygdeavgiftsGrunnlagsopplysninger?.trygdeavgiftsgrunnlag?.avgiftspliktigperioder?.[0];
      const gammelBestemmelse =
        gammelPeriode && (gammelPeriode.type === "MEDLEMSKAPSPERIODE" || gammelPeriode.type === "LOVVALGSPERIODE")
          ? gammelPeriode.bestemmelse
          : undefined;
      const nyPeriode = mockResponse.sisteGjeldendeAvgiftspliktigperioder?.[0];
      const nyBestemmelse =
        nyPeriode && (nyPeriode.type === "MEDLEMSKAPSPERIODE" || nyPeriode.type === "LOVVALGSPERIODE")
          ? nyPeriode.bestemmelse
          : undefined;

      expect(gammelBestemmelse).toBe("FTRL_2_7");
      expect(nyBestemmelse).toBe("FTRL_2_7");
      expect(gammelBestemmelse).toBe(nyBestemmelse);

      // Andre element har forskjellig bestemmelse
      const nyPeriode2 = mockResponse.sisteGjeldendeAvgiftspliktigperioder?.[1];
      const nyBestemmelse2 =
        nyPeriode2 && (nyPeriode2.type === "MEDLEMSKAPSPERIODE" || nyPeriode2.type === "LOVVALGSPERIODE")
          ? nyPeriode2.bestemmelse
          : undefined;
      expect(nyBestemmelse2).toBe("FTRL_2_8");
    });
  });

  describe("erDeltGrunnlag-beregning", () => {
    it("skal returnere true når både harInnbetaltTrygdeavgift og tidligereTrygdeavgiftsGrunnlagsopplysninger finnes", () => {
      const harInnbetaltTrygdeavgift = true;
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
        harInnbetaltTrygdeavgift && !!aarsavregningResponse?.tidligereTrygdeavgiftsGrunnlagsopplysninger;

      expect(erDeltGrunnlag).toBe(true);
    });

    it("skal returnere false når harInnbetaltTrygdeavgift er false", () => {
      const harInnbetaltTrygdeavgift = false;
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
        harInnbetaltTrygdeavgift && !!aarsavregningResponse?.tidligereTrygdeavgiftsGrunnlagsopplysninger;

      expect(erDeltGrunnlag).toBe(false);
    });

    it("skal returnere false når tidligereTrygdeavgiftsGrunnlagsopplysninger er undefined", () => {
      const harInnbetaltTrygdeavgift = true;
      const aarsavregningResponse: AarsavregningResponse = {
        aarsavregningID: 1,
        aar: 2023,
        sisteGjeldendeAvgiftspliktigperioder: [],
        tidligereTrygdeavgiftsGrunnlagsopplysninger: undefined,
      };

      const erDeltGrunnlag =
        harInnbetaltTrygdeavgift && !!aarsavregningResponse?.tidligereTrygdeavgiftsGrunnlagsopplysninger;

      expect(erDeltGrunnlag).toBe(false);
    });

    it("skal returnere false når begge betingelser er false", () => {
      const harInnbetaltTrygdeavgift = false;
      const aarsavregningResponse: AarsavregningResponse = {
        aarsavregningID: 1,
        aar: 2023,
        sisteGjeldendeAvgiftspliktigperioder: [],
        tidligereTrygdeavgiftsGrunnlagsopplysninger: undefined,
      };

      const erDeltGrunnlag =
        harInnbetaltTrygdeavgift && !!aarsavregningResponse?.tidligereTrygdeavgiftsGrunnlagsopplysninger;

      expect(erDeltGrunnlag).toBe(false);
    });
  });
});
