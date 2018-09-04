import Regel from '../index';

describe('Tester regler for studier', () => {
  describe('studererIUtlandet', () => {
    test('returnerer true ved oppholdsland inneholder ikke "NO"', () => {
      const mockSkjema = {
        oppholdsland: ['GB'],
      };

      const regel = new Regel(mockSkjema);

      expect(regel.studier().studererIUtlandet().status).toBe(true);
    });

    test('returnerer false ved oppholdsland inneholder "NO"', () => {
      const mockSkjema = {
        oppholdsland: ['NO'],
      };

      const regel = new Regel(mockSkjema);

      expect(regel.studier().studererIUtlandet().status).toBe(false);
    });

    test('returnerer undefined ved oppholdsland === null', () => {
      const mockSkjema = {
        oppholdsland: null,
      };

      const regel = new Regel(mockSkjema);

      expect(regel.studier().studererIUtlandet().status).toBe(undefined);
    });
  });

  describe('studierFinansieresFraNorge', () => {
    test('returnerer true ved studentFinansiering === "LAANEKASSEN"', () => {
      const mockSkjema = {
        studentFinansiering: 'LAANEKASSEN',
      };

      const regel = new Regel(mockSkjema);

      expect(regel.studier().studierFinansieresFraNorge().status).toBe(true);
    });

    test('returnerer false ved studentFinansiering !== "LAANEKASSEN"', () => {
      const mockSkjema = {
        studentFinansiering: 'ALT_ANNET',
      };

      const regel = new Regel(mockSkjema);

      expect(regel.studier().studierFinansieresFraNorge().status).toBe(false);
    });

    test('returnerer undefined ved studentFinansiering === null', () => {
      const mockSkjema = {
        studentFinansiering: null,
      };

      const regel = new Regel(mockSkjema);

      expect(regel.studier().studierFinansieresFraNorge().status).toBe(undefined);
    });
  });
});
