import { describe, it, expect } from "vitest";
import { AarsavregningTidligereGrunnlagMedlemskapsperioderSelector, ErNyVurderingSelector } from "./selectors";
import { RootState } from "AppTypes";
import { AarsavregningResponse } from "../../services/modules/aarsavregning/aarsavregning";

describe("Aarsavregning Selektorer", () => {
  describe("AarsavregningTidligereGrunnlagMedlemskapsperioderSelector", () => {
    it("skal velge medlemskapsperioder fra tidligereTrygdeavgiftsGrunnlagsopplysninger", () => {
      const mockMedlemskapsperioder = [
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
      ];

      const mockState: Partial<RootState> = {
        aarsavregning: {
          data: {
            aarsavregningID: 1,
            aar: 2023,
            tidligereTrygdeavgiftsGrunnlagsopplysninger: {
              trygdeavgiftsgrunnlag: {
                avgiftspliktigperioder: mockMedlemskapsperioder,
                skatteforholdsperioder: [],
                inntektskperioder: [],
              },
              avgift: {
                trygdeavgiftsperioder: [],
                totalInntekt: 0,
                totalAvgift: 0,
              },
            },
          } as AarsavregningResponse,
          status: "OK",
          error: null,
        },
      } as RootState;

      const result = AarsavregningTidligereGrunnlagMedlemskapsperioderSelector(mockState as RootState);
      expect(result).toEqual(mockMedlemskapsperioder);
    });

    it("skal returnere tom array når tidligereTrygdeavgiftsGrunnlagsopplysninger er null", () => {
      const mockState: Partial<RootState> = {
        aarsavregning: {
          data: {
            aarsavregningID: 1,
            aar: 2023,
            tidligereTrygdeavgiftsGrunnlagsopplysninger: undefined,
          } as AarsavregningResponse,
          status: "OK",
          error: null,
        },
      } as RootState;

      const result = AarsavregningTidligereGrunnlagMedlemskapsperioderSelector(mockState as RootState);
      expect(result).toEqual([]);
    });

    it("skal returnere tom array når tidligereTrygdeavgiftsGrunnlagsopplysninger er undefined", () => {
      const mockState: Partial<RootState> = {
        aarsavregning: {
          data: {
            aarsavregningID: 1,
            aar: 2023,
            tidligereTrygdeavgiftsGrunnlagsopplysninger: undefined,
          } as AarsavregningResponse,
          status: "OK",
          error: null,
        },
      } as RootState;

      const result = AarsavregningTidligereGrunnlagMedlemskapsperioderSelector(mockState as RootState);
      expect(result).toEqual([]);
    });

    it("skal returnere tom array når data er null", () => {
      const mockState: Partial<RootState> = {
        aarsavregning: {
          data: null,
          status: "INIT",
          error: null,
        },
      } as RootState;

      const result = AarsavregningTidligereGrunnlagMedlemskapsperioderSelector(mockState as RootState);
      expect(result).toEqual([]);
    });
  });

  describe("ErNyVurderingSelector", () => {
    it("skal returnere true når erNyVurdering er true", () => {
      const mockState = {
        aarsavregning: {
          data: {} as AarsavregningResponse,
          status: "OK",
          erNyVurdering: true,
        },
      } as unknown as RootState;

      const result = ErNyVurderingSelector(mockState);
      expect(result).toBe(true);
    });

    it("skal returnere false når erNyVurdering er false", () => {
      const mockState = {
        aarsavregning: {
          data: {} as AarsavregningResponse,
          status: "OK",
          erNyVurdering: false,
        },
      } as unknown as RootState;

      const result = ErNyVurderingSelector(mockState);
      expect(result).toBe(false);
    });

    it("skal returnere false når erNyVurdering er undefined (nullish coalescing)", () => {
      const mockState = {
        aarsavregning: {
          data: {} as AarsavregningResponse,
          status: "OK",
          erNyVurdering: undefined,
        },
      } as unknown as RootState;

      const result = ErNyVurderingSelector(mockState);
      expect(result).toBe(false);
    });
  });
});
