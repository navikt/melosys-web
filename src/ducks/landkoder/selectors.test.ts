import each from "jest-each";

import MKV from "../../melosyskodeverk";
import * as DucksTestUtils from "../test-utils";

import { LandkoderFraSakstypeSelector } from "./selectors";
import { STATUS } from "../../services";

describe("LandkoderFraSakstypeSelector", () => {
  const landkoderFraFellesKodeverk = [
    { kode: "kode 1", term: "term 1" },
    { kode: "kode 2", term: "term 2" },
  ];
  const lagState = (sakstypeKode: string) =>
    DucksTestUtils.lagState({
      landkoder: {
        status: STATUS.OK,
        data: landkoderFraFellesKodeverk,
      },
      fagsaker: {
        status: STATUS.OK,
        data: {
          sakstype: {
            kode: sakstypeKode,
          },
        },
      },
    });

  describe("LandkoderFraSakstypeSelector", () => {
    each([
      [MKV.Koder.sakstyper.FTRL, landkoderFraFellesKodeverk],
      [MKV.Koder.sakstyper.EU_EOS, MKV.KTObjects.landkoder],
      [MKV.Koder.sakstyper.TRYGDEAVTALE, landkoderFraFellesKodeverk],
      [null, MKV.KTObjects.landkoder],
    ]).it("returnerer rett landkodeliste for sakstype %s", (sakstypeKode, forventetKodeListe) => {
      const state = lagState(sakstypeKode);

      expect(LandkoderFraSakstypeSelector(state)).toBe(forventetKodeListe);
    });
  });
});
