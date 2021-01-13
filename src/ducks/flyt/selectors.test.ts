import each from "jest-each";

import * as selectors from "./selectors";
import MKV from "../../melosyskodeverk";

import * as DucksTestUtils from "../test-utils";

import { STATUS } from "../../services/utils";

describe("FlytSelectors", () => {
  describe("UtpekingVurderingSelector", () => {
    each([
      [
        MKV.Koder.behandlinger.behandlingstema.BESLUTNING_LOVVALG_ANNET_LAND,
        MKV.Koder.utfallregistreringunntak.GODKJENT,
      ],
      [
        MKV.Koder.behandlinger.behandlingstema.BESLUTNING_LOVVALG_NORGE,
        MKV.Koder.utfallregistreringunntak.IKKE_GODKJENT,
      ],
    ]).describe("UtpekingVurderingSelector med behandlingstema %p", (behandlingstema, forventet) => {
      it(`returnerer ${forventet}`, () => {
        const state = DucksTestUtils.lagState({
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

        expect(selectors.UtpekingVurderingSelector(state)).toBe(forventet);
      });
    });
  });

  describe("ErIArtikkel13_1FlytSelector", () => {
    each([
      [true, MKV.Koder.behandlinger.behandlingstema.ARBEID_FLERE_LAND],
      [false, MKV.Koder.behandlinger.behandlingstema.UTSENDT_SELVSTENDIG],
    ]).it("returnerer korrekt verdi", (forventetResultat, behandlingstema) => {
      const state = DucksTestUtils.lagState({
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
      });

      expect(selectors.ErIArtikkel13_1FlytSelector(state)).toEqual(forventetResultat);
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
