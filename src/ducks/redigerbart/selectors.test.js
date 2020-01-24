import * as selectors from './selectors';

import MKV from '../../melosyskodeverk';

describe('Redigerbartselectors', () => {
  describe('BehandlingsmenyredigerbartSelector', () => {
    const lagState = (redigerbart, behandlingsstatusKode) => ({
      behandlinger: {
        data: {
          redigerbart,
          oppsummering: {
            behandlingsstatus: {
              kode: behandlingsstatusKode,
            },
          },
        },
      },
    });

    each([
      [true, MKV.Koder.behandlinger.behandlingsstatus.UNDER_BEHANDLING, true],
      [false, MKV.Koder.behandlinger.behandlingsstatus.UNDER_BEHANDLING, false],
      [true, MKV.Koder.behandlinger.behandlingsstatus.ANMODNING_UNNTAK_SENDT, true],
      [true, MKV.Koder.behandlinger.behandlingsstatus.ANMODNING_UNNTAK_SENDT, false],
    ]).it('returnerer %p dersom behandlingsstatus er %p og redigerbart er %p', (forventetResultat, behandlingsstatus, redigerbart) => {
      const state = lagState(redigerbart, behandlingsstatus);
      expect(selectors.BehandlingsmenyRedigerbartSelector(state)).toBe(forventetResultat);
    });
  });
});
