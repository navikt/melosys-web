import * as selectors from "./selectors";
import MKV from "../../melosyskodeverk";

import * as DucksTestUtils from "../test-utils";

import { STATUS } from "../../services/utils";

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
});
