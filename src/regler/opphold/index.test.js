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

  describe('erINorgeSeksManederEllerMerPerKalenderAr', () => {
    test('returnerer true ved 6 måneder.', () => {
      const mockSkjema = {
        antallMaanederINorge: 6,
      };

      const regel = new Regel(mockSkjema);

      expect(regel.opphold().erINorgeSeksManederEllerMerPerKalenderAr()).toBe(true);
    });

    test('returnerer false ved 5 måneder.', () => {
      const mockSkjema = {
        antallMaanederINorge: 5,
      };

      const regel = new Regel(mockSkjema);

      expect(regel.opphold().erINorgeSeksManederEllerMerPerKalenderAr()).toBe(false);
    });
  });

  describe('oppholderSegIUtlandet', () => {
    test('returnerer true ved faktaavklaringOppholdsLand != NO', () => {
      const mockSkjema = {
        faktaavklaringOppholdsLand: ['GB'],
      };

      const regel = new Regel(mockSkjema);

      expect(regel.opphold().oppholderSegIUtlandet()).toBe(true);
    });

    test('returnerer true ved faktaavklaringOppholdsLand === NO', () => {
      const mockSkjema = {
        faktaavklaringOppholdsLand: ['NO'],
      };

      const regel = new Regel(mockSkjema);

      expect(regel.opphold().oppholderSegIUtlandet()).toBe(false);
    });

    test('returnerer undefined ved faktaavklaringOppholdsLand === []', () => {
      const mockSkjema = {
        faktaavklaringOppholdsLand: [],
      };

      const regel = new Regel(mockSkjema);

      expect(regel.opphold().oppholderSegIUtlandet()).toBe(undefined);
    });

    test('returnerer undefined ved faktaavklaringOppholdsLand === null', () => {
      const mockSkjema = {
        faktaavklaringOppholdsLand: null,
      };

      const regel = new Regel(mockSkjema);

      expect(regel.opphold().oppholderSegIUtlandet()).toBe(undefined);
    });

    test('returnerer undefined ved faktaavklaringOppholdsLand === undefined', () => {
      const mockSkjema = {
        faktaavklaringOppholdsLand: undefined,
      };

      const regel = new Regel(mockSkjema);

      expect(regel.opphold().oppholderSegIUtlandet()).toBe(undefined);
    });
  });

  describe('harSammeAdresseSomArbeidsgiver', () => {
    test('returnerer true ved sammeAdresseSomArbeidsgiver === "true"', () => {
      const mockSkjema = {
        sammeAdresseSomArbeidsgiver: 'true',
      };

      const regel = new Regel(mockSkjema);

      expect(regel.opphold().harSammeAdresseSomArbeidsgiver()).toBe(true);
    });

    test('returnerer true ved sammeAdresseSomArbeidsgiver === "false', () => {
      const mockSkjema = {
        sammeAdresseSomArbeidsgiver: 'false',
      };

      const regel = new Regel(mockSkjema);

      expect(regel.opphold().harSammeAdresseSomArbeidsgiver()).toBe(false);
    });

    test('returnerer undefined ved sammeAdresseSomArbeidsgiver === undefined', () => {
      const mockSkjema = {
        sammeAdresseSomArbeidsgiver: undefined,
      };

      const regel = new Regel(mockSkjema);

      expect(regel.opphold().harSammeAdresseSomArbeidsgiver()).toBe(undefined);
    });

    test('returnerer undefined ved sammeAdresseSomArbeidsgiver === null', () => {
      const mockSkjema = {
        sammeAdresseSomArbeidsgiver: null,
      };

      const regel = new Regel(mockSkjema);

      expect(regel.opphold().harSammeAdresseSomArbeidsgiver()).toBe(undefined);
    });
  });

  describe('harEktefelleEllerBarnINorge', () => {
    test('returnerer true ved harEktefelleEllerBarnINorge === "true"', () => {
      const mockSkjema = {
        ektefelleEllerBarnINorge: 'true',
      };

      const regel = new Regel(mockSkjema);

      expect(regel.opphold().harEktefelleEllerBarnINorge()).toBe(true);
    });

    test('returnerer true ved harEktefelleEllerBarnINorge === "false', () => {
      const mockSkjema = {
        ektefelleEllerBarnINorge: 'false',
      };

      const regel = new Regel(mockSkjema);

      expect(regel.opphold().harEktefelleEllerBarnINorge()).toBe(false);
    });

    test('returnerer undefined ved harEktefelleEllerBarnINorge === undefined', () => {
      const mockSkjema = {
        ektefelleEllerBarnINorge: undefined,
      };

      const regel = new Regel(mockSkjema);

      expect(regel.opphold().harEktefelleEllerBarnINorge()).toBe(undefined);
    });

    test('returnerer undefined ved harEktefelleEllerBarnINorge === null', () => {
      const mockSkjema = {
        ektefelleEllerBarnINorge: null,
      };

      const regel = new Regel(mockSkjema);

      expect(regel.opphold().harEktefelleEllerBarnINorge()).toBe(undefined);
    });
  });

  describe('harForutgaendeBostedINorge', () => {
    test('returnerer true ved forutgaendeBostedINorge === "true"', () => {
      const mockSkjema = {
        forutgaendeBostedINorge: 'true',
      };

      const regel = new Regel(mockSkjema);

      expect(regel.opphold().harForutgaendeBostedINorge()).toBe(true);
    });

    test('returnerer true ved forutgaendeBostedINorge === "false', () => {
      const mockSkjema = {
        forutgaendeBostedINorge: 'false',
      };

      const regel = new Regel(mockSkjema);

      expect(regel.opphold().harForutgaendeBostedINorge()).toBe(false);
    });

    test('returnerer undefined ved forutgaendeBostedINorge === undefined', () => {
      const mockSkjema = {
        forutgaendeBostedINorge: undefined,
      };

      const regel = new Regel(mockSkjema);

      expect(regel.opphold().harForutgaendeBostedINorge()).toBe(undefined);
    });

    test('returnerer undefined ved forutgaendeBostedINorge === null', () => {
      const mockSkjema = {
        forutgaendeBostedINorge: null,
      };

      const regel = new Regel(mockSkjema);

      expect(regel.opphold().harForutgaendeBostedINorge()).toBe(undefined);
    });
  });
});
