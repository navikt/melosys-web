import MKV from "../../melosyskodeverk";
import * as DucksTestUtils from "../test-utils";

import { LandkoderFraSakstypeSelector } from "./selectors";
import { STATUS } from "../../services";

vi.mock("../../featuretoggle", () => ({
  erFeatureToggleEnabled: () => true,
}));

describe("LandkoderFraSakstypeSelector", () => {
  const landkoderFraFellesKodeverk = [
    { kode: "kode 1", term: "term 1" },
    { kode: "kode 2", term: "term 2" },
  ];
  const lagState = (sakstypeKode: string | undefined) =>
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

  it("returnerer rett landkodeliste for ulike sakstyper", () => {
    let state;

    state = lagState(MKV.Koder.sakstyper.FTRL);
    expect(LandkoderFraSakstypeSelector(state)).toBe(landkoderFraFellesKodeverk);

    state = lagState(MKV.Koder.sakstyper.EU_EOS);
    expect(LandkoderFraSakstypeSelector(state)).toBe(MKV.KTObjects.landkoder);

    state = lagState(MKV.Koder.sakstyper.TRYGDEAVTALE);
    expect(LandkoderFraSakstypeSelector(state)).toBe(MKV.KTObjects.trygdeavtale_myndighetsland);

    state = lagState(undefined);
    expect(LandkoderFraSakstypeSelector(state)).toBe(MKV.KTObjects.landkoder);
  });
});
