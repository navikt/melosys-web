import Regel from '../index';

describe('Tester at regler for opphold', () => {
  describe('inntilTolvManeder', () => {
    test('returnerer true ved 12 mnd', () => {
      const mockSkjema = {
        oppholdUtlandFom: '01.01.2018',
        oppholdUtlandTom: '31.12.2018',
      };

      const regel = new Regel(mockSkjema);

      expect(regel.opphold().inntilTolvManeder()).toBe(true);
    });

    test('returnerer false ved mer enn 12 mnd', () => {
      const mockSkjema = {
        oppholdUtlandFom: '01.01.2018',
        oppholdUtlandTom: '01.01.2019',
      };

      const regel = new Regel(mockSkjema);

      expect(regel.opphold().inntilTolvManeder()).toBe(false);
    });

    test('returnerer undefined ved ingen eller ukurant dato', () => {
      const mockSkjema = {
        oppholdUtlandFom: '',
        oppholdUtlandTom: undefined,
      };

      const regel = new Regel(mockSkjema);

      expect(regel.opphold().inntilTolvManeder()).toBe(undefined);
    });
  });
});
