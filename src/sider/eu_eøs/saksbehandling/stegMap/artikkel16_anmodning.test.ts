import * as KV from "../../../../kodeverk";

import Artikkel16Anmodning from "./artikkel16_anmodning";

import { STEG } from "../../../../felleskomponenter/stegvelger";

import MKV from "../../../../melosyskodeverk";

const { UNDER_BEHANDLING, AVSLUTTET } = MKV.Koder.behandlinger.behandlingsstatus;
const { INNVILGELSE } = MKV.Koder.anmodningsperiodesvartyper;

describe("artikkel16_anmodning", () => {
  it(`har ${STEG.ARTIKKEL_16_MOTTA_SVAR} som neste steg når anmodning er sendt utland og behandlingsstatus er ${UNDER_BEHANDLING}`, () => {
    const artikkel16AnmodningSteg = new Artikkel16Anmodning({
      behandlingsstatus: KV.kodeTilObjekt(UNDER_BEHANDLING, MKV.KTObjects.behandlinger.behandlingsstatus),
      anmodningsperioder: [{ sendtUtland: true }],
      vilkar: [],
    });

    expect(artikkel16AnmodningSteg.nesteSteg()).toBe(STEG.ARTIKKEL_16_MOTTA_SVAR);
  });

  it(`har ${STEG.ARTIKKEL_16_MOTTA_SVAR} som neste steg når anmodning er sendt utland, behandlingsstatus er ${AVSLUTTET} og utland har svart på anmodning om unntak`, () => {
    const artikkel16AnmodningSteg = new Artikkel16Anmodning({
      behandlingsstatus: KV.kodeTilObjekt(AVSLUTTET, MKV.KTObjects.behandlinger.behandlingsstatus),
      anmodningsperioder: [{ sendtUtland: true }],
      anmodningsperiodesvar: {
        anmodningsperiodeSvarType: INNVILGELSE,
        endretPeriode: {
          fom: "2020-02-02",
          tom: "2021-02-02",
        },
        begrunnelseFritekst: "Fritekst",
      },
      vilkar: [],
    });

    expect(artikkel16AnmodningSteg.nesteSteg()).toBe(STEG.ARTIKKEL_16_MOTTA_SVAR);
  });

  it(`har ikke ${STEG.ARTIKKEL_16_MOTTA_SVAR} som neste steg når behandling har blitt revurdert før utland har svart på anmodning om unntak`, () => {
    const artikkel16AnmodningSteg = new Artikkel16Anmodning({
      behandlingsstatus: KV.kodeTilObjekt(AVSLUTTET, MKV.KTObjects.behandlinger.behandlingsstatus),
      anmodningsperioder: [{ sendtUtland: true }],
      anmodningsperiodesvar: {
        anmodningsperiodeSvarType: null,
        endretPeriode: {
          fom: null,
          tom: null,
        },
        begrunnelseFritekst: null,
      },
      vilkar: [],
    });

    expect(artikkel16AnmodningSteg.nesteSteg()).not.toBe(STEG.ARTIKKEL_16_MOTTA_SVAR);
  });
});
