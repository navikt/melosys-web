import StonadRegel from './StonadRegel';

describe('Tester regler for stonad', () => {
  describe('mottarEOSBarnetrygdFraNav', () => {
    test('returnerer true ved EOSBarnetrygdFraNAV === true', () => {
      const mockSkjema = {};
      const mockSaksopplysning = { sakOgBehandling: { eosBarnetrygd: true } };

      const stonadRegel = new StonadRegel(mockSkjema, mockSaksopplysning);

      expect(stonadRegel.mottarEOSBarnetrygdFraNav().status).toBe(true);
    });

    test('returnerer false ved EOSBarnetrygdFraNAV === false', () => {
      const mockSkjema = {};
      const mockSaksopplysning = { sakOgBehandling: { eosBarnetrygd: false } };

      const stonadRegel = new StonadRegel(mockSkjema, mockSaksopplysning);

      expect(stonadRegel.mottarEOSBarnetrygdFraNav().status).toBe(false);
    });

    test('returnerer false ved EOSBarnetrygdFraNAV === null', () => {
      const mockSkjema = {};
      const mockSaksopplysning = { sakOgBehandling: { eosBarnetrygd: null } };

      const stonadRegel = new StonadRegel(mockSkjema, mockSaksopplysning);

      expect(stonadRegel.mottarEOSBarnetrygdFraNav().status).toBe(undefined);
    });
  });
});
