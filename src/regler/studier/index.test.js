import Regel from '../index';

describe('Tester regler for studier', () => {
  describe('studererIUtlandet', () => {
    test('returnerer true ved studieLand !== NO', () => {
      const mockSkjema = {
        studieLand: ['GB'],
      };

      const regel = new Regel(mockSkjema);

      expect(regel.studier().studererIUtlandet()).toBe(true);
    });

    test('returnerer false ved studieLand === NO', () => {
      const mockSkjema = {
        studieLand: ['NO'],
      };

      const regel = new Regel(mockSkjema);

      expect(regel.studier().studererIUtlandet()).toBe(false);
    });

    test('returnerer undefined ved studieLand === null', () => {
      const mockSkjema = {
        studieLand: null,
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
