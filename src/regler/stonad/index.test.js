import Regel from '../index';

describe('Tester regler for stonad', () => {
  describe('mottarEOSBarnetrygdFraNav', () => {
    test('returnerer true ved EOSBarnetrygdFraNAV === true', () => {
      const mockSkjema = {};
      const mockSaksopplysning = { sakOgBehandling: { eosBarnetrygd: true } };

      const regel = new Regel(mockSkjema, mockSaksopplysning);

      expect(regel.stonad().mottarEOSBarnetrygdFraNav().status).toBe(true);
    });

    test('returnerer false ved EOSBarnetrygdFraNAV === false', () => {
      const mockSkjema = {};
      const mockSaksopplysning = { sakOgBehandling: { eosBarnetrygd: false } };

      const regel = new Regel(mockSkjema, mockSaksopplysning);

      expect(regel.stonad().mottarEOSBarnetrygdFraNav().status).toBe(false);
    });

    test('returnerer false ved EOSBarnetrygdFraNAV === null', () => {
      const mockSkjema = {};
      const mockSaksopplysning = { sakOgBehandling: { eosBarnetrygd: null } };

      const regel = new Regel(mockSkjema, mockSaksopplysning);

      expect(regel.stonad().mottarEOSBarnetrygdFraNav().status).toBe(undefined);
    });
  });
});
