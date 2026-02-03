import * as selectors from "./selectors";
import MKV from "../../melosyskodeverk";
import * as KV from "../../kodeverk";

import * as DucksTestUtils from "../test-utils";

import { STATUS } from "../../services";

describe("FlytSelectors", () => {
  describe("UtpekingVurderingSelector", () => {
    const lagState = (behandlingstema: string) =>
      DucksTestUtils.lagState({
        behandlinger: {
          status: STATUS.OK,
          data: {
            oppsummering: {
              behandlingstema: {
                kode: behandlingstema,
              },
            },
          },
        },
        behandlingsresultat: {
          status: STATUS.OK,
          data: {
            utfallRegistreringUnntak: MKV.Koder.utfallregistreringunntak.GODKJENT,
            utfallUtpeking: MKV.Koder.utfallregistreringunntak.IKKE_GODKJENT,
          },
        },
      });

    it("BESLUTNING_LOVVALG_ANNET_LAND returnerer utfall GODKJENT", () => {
      const state = lagState(MKV.Koder.behandlinger.behandlingstema.BESLUTNING_LOVVALG_ANNET_LAND);
      expect(selectors.UtpekingVurderingSelector(state)).toBe(MKV.Koder.utfallregistreringunntak.GODKJENT);
    });

    it("BESLUTNING_LOVVALG_NORGE returnerer utfall IKKE_GODKJENT", () => {
      const state = lagState(MKV.Koder.behandlinger.behandlingstema.BESLUTNING_LOVVALG_NORGE);
      expect(selectors.UtpekingVurderingSelector(state)).toBe(MKV.Koder.utfallregistreringunntak.IKKE_GODKJENT);
    });
  });

  describe("HarValgtNorskArbeidsgiverSelector", () => {
    const { resultFunc } = selectors.HarValgtNorskArbeidsgiverSelector;

    it("returnerer true når norsk virksomhet er valgt", () => {
      expect(resultFunc([{}])).toBe(true);
    });

    it("returnerer false når norsk virksomhet ikke er valgt", () => {
      expect(resultFunc([])).toBe(false);
    });
  });

  describe("HarOffentligTjenesteINorgeSelector", () => {
    const { resultFunc } = selectors.HarOffentligTjenesteINorgeSelector;

    it("returnerer true for NORGE_OG_ANNEN_VIRKSOMHET", () => {
      expect(resultFunc(KV.Koder.OffentligArbeidAntallLand.NORGE_OG_ANNEN_VIRKSOMHET)).toBe(true);
    });

    it("returnerer false for annen verdi", () => {
      expect(resultFunc("ANNET")).toBe(false);
    });
  });

  describe("HarOffentligTjenesteAnnetLandSelector", () => {
    const { resultFunc } = selectors.HarOffentligTjenesteAnnetLandSelector;

    it("returnerer true for ANNET_LAND_OG_ANNEN_VIRKSOMHET", () => {
      expect(resultFunc(KV.Koder.OffentligArbeidAntallLand.ANNET_LAND_OG_ANNEN_VIRKSOMHET)).toBe(true);
    });

    it("returnerer false for annen verdi", () => {
      expect(resultFunc("NORGE")).toBe(false);
    });
  });

  describe("HarLonnetArbeidAnnetLand", () => {
    const { resultFunc } = selectors.HarLonnetArbeidAnnetLand;

    it("returnerer true for ETT_ANNET_LAND", () => {
      expect(resultFunc(KV.Koder.LoennetArbeidAntallLand.ETT_ANNET_LAND)).toBe(true);
    });

    it("returnerer false for annen verdi", () => {
      expect(resultFunc("FLERE_LAND")).toBe(false);
    });
  });

  describe("ErIDirekteTilArtikkel16FlytSelector", () => {
    const { resultFunc } = selectors.ErIDirekteTilArtikkel16FlytSelector;

    it("returnerer true når avklart fakta inneholder ORDINAER_UTEN_ART12", () => {
      const avklarteFakta = [{ fakta: [KV.Koder.VurderingYrkesgruppeTyper.ORDINAER_UTEN_ART12] }] as any;
      expect(resultFunc(avklarteFakta)).toBe(true);
    });

    it("returnerer false for tom liste", () => {
      expect(resultFunc([])).toBe(false);
    });

    it("returnerer false når fakta er null", () => {
      expect(resultFunc([{ fakta: null }] as any)).toBe(false);
    });
  });
});
