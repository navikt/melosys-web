import Regel from '../index';

describe('Tester regler for studier', () => {
  describe('studererIUtlandet', () => {
    test('returnerer true ved oppholdsland !== NO', () => {
      const mockSkjema = {
        oppholdsland: ['GB'],
      };

      const regel = new Regel(mockSkjema);

      expect(regel.studier().studererIUtlandet()).toBe(true);
    });

    test('returnerer false ved oppholdsland === NO', () => {
      const mockSkjema = {
        oppholdsland: ['NO'],
      };

      const regel = new Regel(mockSkjema);

      expect(regel.studier().studererIUtlandet()).toBe(false);
    });

    test('returnerer undefined ved oppholdsland === null', () => {
      const mockSkjema = {
        oppholdsland: null,
      };

      const regel = new Regel(mockSkjema);

      expect(regel.studier().studererIUtlandet()).toBe(undefined);
    });
  });

  describe('studierFinansieresFraNorge', () => {
    test('returnerer true ved studentFinansiering === "LAANEKASSEN"', () => {
      const mockSkjema = {
        studentFinansiering: 'LAANEKASSEN',
      };

      const regel = new Regel(mockSkjema);

      expect(regel.studier().studierFinansieresFraNorge()).toBe(true);
    });

    test('returnerer false ved studentFinansiering !== "LAANEKASSEN"', () => {
      const mockSkjema = {
        studentFinansiering: 'ALT_ANNET',
      };

      const regel = new Regel(mockSkjema);

      expect(regel.studier().studierFinansieresFraNorge()).toBe(false);
    });

    test('returnerer undefined ved studentFinansiering === null', () => {
      const mockSkjema = {
        studentFinansiering: null,
      };

      const regel = new Regel(mockSkjema);

      expect(regel.studier().studierFinansieresFraNorge()).toBe(undefined);
    });
  });
});
