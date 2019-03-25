import StudierRegel from './StudierRegel';

describe('Tester regler for studier', () => {
  describe('studererIUtlandet', () => {
    test('returnerer true ved oppholdsland inneholder ikke "NO"', () => {
      const mockSkjema = {
        oppholdsland: ['GB'],
      };

      const studieRegel = new StudierRegel(mockSkjema);
      expect(studieRegel.studererIUtlandet().status).toBe(true);
    });

    test('returnerer false ved oppholdsland inneholder "NO"', () => {
      const mockSkjema = {
        oppholdsland: ['NO'],
      };

      const studieRegel = new StudierRegel(mockSkjema);

      expect(studieRegel.studererIUtlandet().status).toBe(false);
    });

    test('returnerer undefined ved oppholdsland === null', () => {
      const mockSkjema = {
        oppholdsland: null,
      };

      const studieRegel = new StudierRegel(mockSkjema);

      expect(studieRegel.studererIUtlandet().status).toBe(undefined);
    });
  });

  describe('studierFinansieresFraNorge', () => {
    test('returnerer true ved studentFinansiering === "LAANEKASSEN"', () => {
      const mockSkjema = {
        studentFinansiering: 'LAANEKASSEN',
      };

      const studieRegel = new StudierRegel(mockSkjema);

      expect(studieRegel.studierFinansieresFraNorge().status).toBe(true);
    });

    test('returnerer false ved studentFinansiering !== "LAANEKASSEN"', () => {
      const mockSkjema = {
        studentFinansiering: 'ALT_ANNET',
      };

      const studieRegel = new StudierRegel(mockSkjema);

      expect(studieRegel.studierFinansieresFraNorge().status).toBe(false);
    });

    test('returnerer undefined ved studentFinansiering === null', () => {
      const mockSkjema = {
        studentFinansiering: null,
      };

      const studieRegel = new StudierRegel(mockSkjema);

      expect(studieRegel.studierFinansieresFraNorge().status).toBe(undefined);
    });
  });
});
