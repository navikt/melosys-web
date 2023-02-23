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
    each([
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
    ]).it(
      "returnerer %p dersom behandlingsstatus er %p, redigerbart er %p, og behandlingstype er %p",
      (forventetResultat, behandlingsstatus, redigerbart, behandlingstype, sendtUtland) => {
        const state = lagState(redigerbart, behandlingsstatus, behandlingstype);
        state.anmodningsperioder = {
          data: [{ sendtUtland }],
        };
        expect(selectors.PanelerRedigerbartSelector(state)).toBe(forventetResultat);
      }
    );
  });
});
