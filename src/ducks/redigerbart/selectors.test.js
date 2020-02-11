import * as selectors from './selectors';

import MKV from '../../melosyskodeverk';

describe('Redigerbartselectors', () => {
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
  });

  describe('BehandlingsmenyredigerbartSelector', () => {
    each([
      [true, MKV.Koder.behandlinger.behandlingsstatus.UNDER_BEHANDLING, true, MKV.Koder.behandlinger.behandlingstyper.SOEKNAD],
      [false, MKV.Koder.behandlinger.behandlingsstatus.UNDER_BEHANDLING, false, MKV.Koder.behandlinger.behandlingstyper.SOEKNAD],
      [true, MKV.Koder.behandlinger.behandlingsstatus.ANMODNING_UNNTAK_SENDT, true, MKV.Koder.behandlinger.behandlingstyper.SOEKNAD],
      [true, MKV.Koder.behandlinger.behandlingsstatus.ANMODNING_UNNTAK_SENDT, false, MKV.Koder.behandlinger.behandlingstyper.SOEKNAD],
      [true, MKV.Koder.behandlinger.behandlingsstatus.UNDER_BEHANDLING, true, MKV.Koder.behandlinger.behandlingstyper.ENDRET_PERIODE],
    ]).it('returnerer %p dersom behandlingsstatus er %p, redigerbart er %p, og behandlingstype er %p', (forventetResultat, behandlingsstatus, redigerbart, behandlingstype) => {
      const state = lagState(redigerbart, behandlingsstatus, behandlingstype);
      expect(selectors.BehandlingsmenyRedigerbartSelector(state)).toBe(forventetResultat);
    });
  });

  describe('PanelerRedigerbartSelector', () => {
    each([
      [false, MKV.Koder.behandlinger.behandlingsstatus.ANMODNING_UNNTAK_SENDT, true, MKV.Koder.behandlinger.behandlingstyper.SOEKNAD, true],
      [false, MKV.Koder.behandlinger.behandlingsstatus.ANMODNING_UNNTAK_SENDT, false, MKV.Koder.behandlinger.behandlingstyper.SOEKNAD, false],
      [false, MKV.Koder.behandlinger.behandlingsstatus.UNDER_BEHANDLING, true, MKV.Koder.behandlinger.behandlingstyper.ENDRET_PERIODE, false],
      [true, MKV.Koder.behandlinger.behandlingsstatus.UNDER_BEHANDLING, true, MKV.Koder.behandlinger.behandlingstyper.SOEKNAD, false],
    ]).it('returnerer %p dersom behandlingsstatus er %p, redigerbart er %p, og behandlingstype er %p', (forventetResultat, behandlingsstatus, redigerbart, behandlingstype, sendtUtland) => {
      const state = lagState(redigerbart, behandlingsstatus, behandlingstype);
      state.anmodningsperioder = {
        data: [
          { sendtUtland },
        ],
      };
      expect(selectors.PanelerRedigerbartSelector(state)).toBe(forventetResultat);
    });
  });

  describe('SidedialogRedigerbartSelector', () => {
    each([
      [false, MKV.Koder.behandlinger.behandlingsstatus.ANMODNING_UNNTAK_SENDT, true, MKV.Koder.behandlinger.behandlingstyper.SOEKNAD, true],
      [false, MKV.Koder.behandlinger.behandlingsstatus.ANMODNING_UNNTAK_SENDT, false, MKV.Koder.behandlinger.behandlingstyper.SOEKNAD, false],
      [true, MKV.Koder.behandlinger.behandlingsstatus.UNDER_BEHANDLING, true, MKV.Koder.behandlinger.behandlingstyper.ENDRET_PERIODE, false],
      [true, MKV.Koder.behandlinger.behandlingsstatus.UNDER_BEHANDLING, true, MKV.Koder.behandlinger.behandlingstyper.SOEKNAD, false],
    ]).it('returnerer %p dersom behandlingsstatus er %p, redigerbart er %p, og behandlingstype er %p', (forventetResultat, behandlingsstatus, redigerbart, behandlingstype, sendtUtland) => {
      const state = lagState(redigerbart, behandlingsstatus, behandlingstype);
      state.anmodningsperioder = {
        data: [
          { sendtUtland },
        ],
      };
      expect(selectors.SidedialogRedigerbartSelector(state)).toBe(forventetResultat);
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
