import * as selectors from './selectors';

import MKV from '../../melosyskodeverk';

describe('Redigerbartselectors', () => {
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

  describe('BehandlingsmenyredigerbartSelector', () => {
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

  describe('ModalHenleggRedigerbartSelector', () => {
    each([
      [true, MKV.Koder.behandlinger.behandlingsstatus.UNDER_BEHANDLING, true],
      [false, MKV.Koder.behandlinger.behandlingsstatus.UNDER_BEHANDLING, false],
      [true, MKV.Koder.behandlinger.behandlingsstatus.ANMODNING_UNNTAK_SENDT, true],
      [true, MKV.Koder.behandlinger.behandlingsstatus.ANMODNING_UNNTAK_SENDT, false],
    ]).it('returnerer %p dersom behandlingsstatus er %p og redigerbart er %p', (forventetResultat, behandlingsstatus, redigerbart) => {
      const state = lagState(redigerbart, behandlingsstatus);
      expect(selectors.ModalHenleggRedigerbartSelector(state)).toBe(forventetResultat);
    });
  });

  describe('ModalAvsluttSomBortfaltRedigerbartSelector', () => {
    each([
      [true, MKV.Koder.behandlinger.behandlingsstatus.UNDER_BEHANDLING, true],
      [false, MKV.Koder.behandlinger.behandlingsstatus.UNDER_BEHANDLING, false],
      [true, MKV.Koder.behandlinger.behandlingsstatus.ANMODNING_UNNTAK_SENDT, true],
      [true, MKV.Koder.behandlinger.behandlingsstatus.ANMODNING_UNNTAK_SENDT, false],
    ]).it('returnerer %p dersom behandlingsstatus er %p og redigerbart er %p', (forventetResultat, behandlingsstatus, redigerbart) => {
      const state = lagState(redigerbart, behandlingsstatus);
      expect(selectors.ModalAvsluttSomBortfaltRedigerbartSelector(state)).toBe(forventetResultat);
    });
  });
});
