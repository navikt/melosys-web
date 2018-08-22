import Regel from '../index';

describe('Tester regler for stonad', () => {
  describe('mottarEOSBarnetrygdFraNav', () => {
    test('returnerer true ved EOSBarnetrygdFraNAV === "true"', () => {
      const mockSkjema = {
        EOSBarnetrygdFraNAV: 'true',
      };

      const regel = new Regel(mockSkjema);

      expect(regel.stonad().mottarEOSBarnetrygdFraNav()).toBe(true);
    });

    test('returnerer false ved EOSBarnetrygdFraNAV === "false"', () => {
      const mockSkjema = {
        EOSBarnetrygdFraNAV: 'false',
      };

      const regel = new Regel(mockSkjema);

      expect(regel.stonad().mottarEOSBarnetrygdFraNav()).toBe(false);
    });

    test('returnerer false ved EOSBarnetrygdFraNAV === null"', () => {
      const mockSkjema = {
        EOSBarnetrygdFraNAV: null,
      };

      const regel = new Regel(mockSkjema);

      expect(regel.stonad().mottarEOSBarnetrygdFraNav()).toBe(undefined);
    });
  });
});
