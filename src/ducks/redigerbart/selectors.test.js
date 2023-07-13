import * as selectors from "./selectors";

import MKV from "../../melosyskodeverk";

describe("Redigerbartselectors", () => {
  const lagState = (redigerbart, behandlingsstatusKode, behandlingstypeKode) => ({
    behandlinger: {
      data: {
        redigerbart,
        oppsummering: {
          behandlingsstatus: {
            kode: behandlingsstatusKode,
          },
          behandlingstype: {
            kode: behandlingstypeKode,
          },
        },
      },
    },
    fagsaker: {
      data: {},
    },
  });

  describe("PanelerRedigerbartSelector", () => {
    it("returnerer %p dersom behandlingsstatus er %p, redigerbart er %p, og behandlingstype er %p", () => {
      const data = [
        [
          false,
          MKV.Koder.behandlinger.behandlingsstatus.ANMODNING_UNNTAK_SENDT,
          true,
          MKV.Koder.behandlinger.behandlingstyper.FØRSTEGANG,
          true,
        ],
        [
          false,
          MKV.Koder.behandlinger.behandlingsstatus.ANMODNING_UNNTAK_SENDT,
          false,
          MKV.Koder.behandlinger.behandlingstyper.FØRSTEGANG,
          false,
        ],
        [
          false,
          MKV.Koder.behandlinger.behandlingsstatus.UNDER_BEHANDLING,
          true,
          MKV.Koder.behandlinger.behandlingstyper.ENDRET_PERIODE,
          false,
        ],
        [
          true,
          MKV.Koder.behandlinger.behandlingsstatus.UNDER_BEHANDLING,
          true,
          MKV.Koder.behandlinger.behandlingstyper.FØRSTEGANG,
          false,
        ],
      ];

      data.forEach((testdata) => {
        const state = lagState(testdata[2], testdata[1], testdata[3]);
        state.anmodningsperioder = {
          data: [{ sendtUtland: testdata[4] }],
        };
        expect(selectors.PanelerRedigerbartSelector(state)).toBe(testdata[0]);
      });
    });
  });
});
