import Regel from '../index';

describe('Tester regler for opphold', () => {
  test('inntilTolvManeder', () => {
    const skjema = {
      oppholdUtlandFom: '01.01.2018',
      oppholdUtlandTom: '01.01.2019',
    };
    const regel = new Regel(skjema);

    expect(regel.opphold().inntilTolvManeder()).toBe(false);
  });
});
