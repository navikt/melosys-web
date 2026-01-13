import { describe, it, expect } from "vitest";
import {
  AlleMedlemskapsperioderSelector,
  BestemmelseSelector,
  InnvilgetEllerDelvisInnvilgetMedlemskapsperioderSelector,
  SamletInnvilgetMedlemskapsperiodeSelector,
} from "./selectors";
import { Medlemskapsperiode } from "../../services/modules/types/periodeTyper";
import { RootState } from "AppTypes";

const lagMedlemskapsperiode = (overrides?: Partial<Medlemskapsperiode>): Medlemskapsperiode => ({
  id: 1,
  type: "MEDLEMSKAPSPERIODE",
  fomDato: "2024-01-01",
  tomDato: "2024-12-31",
  bestemmelse: "FTRL_KAP2_2_5_FØRSTE_LEDD_A",
  innvilgelsesResultat: "INNVILGET",
  trygdedekning: "FULL_DEKNING_FTRL",
  medlemskapstype: "PLIKTIG",
  ...overrides,
});

const lagState = (medlemskapsperioder: Medlemskapsperiode[]): RootState =>
  ({
    medlemskapsperioder: {
      status: "LASTET",
      data: {
        medlemskapsperioder,
      },
    },
  }) as unknown as RootState;

describe("medlemskapsperioder selectors", () => {
  describe("AlleMedlemskapsperioderSelector", () => {
    it("skal returnere tom liste når ingen perioder finnes", () => {
      const state = lagState([]);
      expect(AlleMedlemskapsperioderSelector(state)).toEqual([]);
    });

    it("skal returnere alle perioder", () => {
      const perioder = [lagMedlemskapsperiode({ id: 1 }), lagMedlemskapsperiode({ id: 2 })];
      const state = lagState(perioder);
      expect(AlleMedlemskapsperioderSelector(state)).toHaveLength(2);
    });
  });

  describe("BestemmelseSelector", () => {
    it("skal returnere tom streng når ingen perioder finnes", () => {
      const state = lagState([]);
      expect(BestemmelseSelector(state)).toBe("");
    });

    it("skal returnere bestemmelse fra første periode (sortert etter fomDato)", () => {
      const perioder = [
        lagMedlemskapsperiode({ id: 1, fomDato: "2024-06-01", bestemmelse: "BESTEMMELSE_B" }),
        lagMedlemskapsperiode({ id: 2, fomDato: "2024-01-01", bestemmelse: "BESTEMMELSE_A" }),
      ];
      const state = lagState(perioder);
      expect(BestemmelseSelector(state)).toBe("BESTEMMELSE_A");
    });

    it("skal returnere bestemmelse når periode har innvilgelsesResultat", () => {
      const perioder = [lagMedlemskapsperiode({ bestemmelse: "FTRL_KAP2_2_5_FØRSTE_LEDD_E" })];
      const state = lagState(perioder);
      expect(BestemmelseSelector(state)).toBe("FTRL_KAP2_2_5_FØRSTE_LEDD_E");
    });
  });

  describe("InnvilgetEllerDelvisInnvilgetMedlemskapsperioderSelector", () => {
    it("skal filtrere ut perioder som ikke er innvilget eller delvis innvilget", () => {
      const perioder = [
        lagMedlemskapsperiode({ id: 1, innvilgelsesResultat: "INNVILGET" }),
        lagMedlemskapsperiode({ id: 2, innvilgelsesResultat: "DELVIS_INNVILGET" }),
        lagMedlemskapsperiode({ id: 3, innvilgelsesResultat: "AVSLÅTT" }),
      ];
      const state = lagState(perioder);
      const resultat = InnvilgetEllerDelvisInnvilgetMedlemskapsperioderSelector(state);

      expect(resultat).toHaveLength(2);
      expect(resultat.map((p) => p.id)).toEqual([1, 2]);
    });
  });

  describe("SamletInnvilgetMedlemskapsperiodeSelector", () => {
    it("skal returnere undefined når ingen innvilgede perioder finnes", () => {
      const perioder = [lagMedlemskapsperiode({ innvilgelsesResultat: "AVSLÅTT" })];
      const state = lagState(perioder);
      expect(SamletInnvilgetMedlemskapsperiodeSelector(state)).toBeUndefined();
    });

    it("skal returnere samlet periode fra første til siste innvilgede", () => {
      const perioder = [
        lagMedlemskapsperiode({
          id: 1,
          fomDato: "2024-01-01",
          tomDato: "2024-06-30",
          innvilgelsesResultat: "INNVILGET",
        }),
        lagMedlemskapsperiode({
          id: 2,
          fomDato: "2024-07-01",
          tomDato: "2024-12-31",
          innvilgelsesResultat: "INNVILGET",
        }),
      ];
      const state = lagState(perioder);
      const resultat = SamletInnvilgetMedlemskapsperiodeSelector(state);

      expect(resultat).toEqual({
        fom: "2024-01-01",
        tom: "2024-12-31",
      });
    });

    it("skal ignorere delvis innvilgede perioder", () => {
      const perioder = [
        lagMedlemskapsperiode({
          id: 1,
          fomDato: "2024-01-01",
          tomDato: "2024-06-30",
          innvilgelsesResultat: "INNVILGET",
        }),
        lagMedlemskapsperiode({
          id: 2,
          fomDato: "2024-07-01",
          tomDato: "2024-12-31",
          innvilgelsesResultat: "DELVIS_INNVILGET",
        }),
      ];
      const state = lagState(perioder);
      const resultat = SamletInnvilgetMedlemskapsperiodeSelector(state);

      expect(resultat).toEqual({
        fom: "2024-01-01",
        tom: "2024-06-30",
      });
    });
  });
});
