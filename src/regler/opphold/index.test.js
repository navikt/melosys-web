import Regel from '../index';

describe('Tester at regler for opphold', () => {
  describe('inntilTolvManeder', () => {
    test('returnerer true ved 12 mnd', () => {
      const mockSkjema = {
        oppholdUtlandFom: '01.01.2018',
        oppholdUtlandTom: '31.12.2018',
      };

      const regel = new Regel(mockSkjema);

      expect(regel.opphold().inntilTolvMaaneder().status).toBe(true);
    });

    test('returnerer false ved mer enn 12 mnd', () => {
      const mockSkjema = {
        oppholdUtlandFom: '01.01.2018',
        oppholdUtlandTom: '04.01.2019',
      };

      const regel = new Regel(mockSkjema);

      expect(regel.opphold().inntilTolvMaaneder().status).toBe(false);
    });

    test('returnerer undefined ved ingen eller ukurant dato', () => {
      const mockSkjema = {
        oppholdUtlandFom: '',
        oppholdUtlandTom: null,
      };

      const regel = new Regel(mockSkjema);

      expect(regel.opphold().inntilTolvMaaneder().status).toBe(undefined);
    });
  });

  describe('erINorgeSeksManederEllerMerPerKalenderAr', () => {
    test('returnerer true ved 6 måneder.', () => {
      const mockSkjema = {
        antallMaanederINorge: 6,
      };

      const regel = new Regel(mockSkjema);

      expect(regel.opphold().erINorgeSeksManederEllerMerPerKalenderAr().status).toBe(true);
    });

    test('returnerer false ved 5 måneder.', () => {
      const mockSkjema = {
        antallMaanederINorge: 5,
      };

      const regel = new Regel(mockSkjema);

      expect(regel.opphold().erINorgeSeksManederEllerMerPerKalenderAr().status).toBe(false);
    });
  });

  describe('oppholderSegIUtlandet', () => {
    test('returnerer true ved avklartefaktaOppholdsLand != "NO"', () => {
      const mockSkjema = {
        avklartefaktaOppholdsLand: ['GB'],
      };

      const regel = new Regel(mockSkjema);

      expect(regel.opphold().oppholderSegIUtlandet().status).toBe(true);
    });

    test('returnerer true ved avklartefaktaOppholdsLand === "NO"', () => {
      const mockSkjema = {
        avklartefaktaOppholdsLand: ['NO'],
      };

      const regel = new Regel(mockSkjema);

      expect(regel.opphold().oppholderSegIUtlandet().status).toBe(false);
    });

    test('returnerer undefined ved avklartefaktaOppholdsLand === []', () => {
      const mockSkjema = {
        avklartefaktaOppholdsLand: [],
      };

      const regel = new Regel(mockSkjema);

      expect(regel.opphold().oppholderSegIUtlandet().status).toBe(undefined);
    });

    test('returnerer undefined ved avklartefaktaOppholdsLand === null', () => {
      const mockSkjema = {
        avklartefaktaOppholdsLand: null,
      };

      const regel = new Regel(mockSkjema);

      expect(regel.opphold().oppholderSegIUtlandet().status).toBe(undefined);
    });

    test('returnerer undefined ved avklartefaktaOppholdsLand === undefined', () => {
      const mockSkjema = {
        avklartefaktaOppholdsLand: undefined,
      };

      const regel = new Regel(mockSkjema);

      expect(regel.opphold().oppholderSegIUtlandet().status).toBe(undefined);
    });
  });

  describe('harSammeAdresseSomArbeidsgiver', () => {
    test('returnerer true ved sammeAdresseSomArbeidsgiver === true', () => {
      const mockSkjema = {
        sammeAdresseSomArbeidsgiver: true,
      };

      const regel = new Regel(mockSkjema);

      expect(regel.opphold().harSammeAdresseSomArbeidsgiver().status).toBe(true);
    });

    test('returnerer true ved sammeAdresseSomArbeidsgiver === false', () => {
      const mockSkjema = {
        sammeAdresseSomArbeidsgiver: false,
      };

      const regel = new Regel(mockSkjema);

      expect(regel.opphold().harSammeAdresseSomArbeidsgiver().status).toBe(false);
    });

    test('returnerer undefined ved sammeAdresseSomArbeidsgiver === undefined', () => {
      const mockSkjema = {
        sammeAdresseSomArbeidsgiver: undefined,
      };

      const regel = new Regel(mockSkjema);

      expect(regel.opphold().harSammeAdresseSomArbeidsgiver().status).toBe(undefined);
    });

    test('returnerer undefined ved sammeAdresseSomArbeidsgiver === null', () => {
      const mockSkjema = {
        sammeAdresseSomArbeidsgiver: null,
      };

      const regel = new Regel(mockSkjema);

      expect(regel.opphold().harSammeAdresseSomArbeidsgiver().status).toBe(undefined);
    });
  });

  describe('harEktefelleEllerBarnINorge', () => {
    test('returnerer true ved harEktefelleEllerBarnINorge === true', () => {
      const mockSkjema = {
        ektefelleEllerBarnINorge: true,
      };

      const regel = new Regel(mockSkjema);

      expect(regel.opphold().harEktefelleEllerBarnINorge().status).toBe(true);
    });

    test('returnerer true ved harEktefelleEllerBarnINorge === false', () => {
      const mockSkjema = {
        ektefelleEllerBarnINorge: false,
      };

      const regel = new Regel(mockSkjema);

      expect(regel.opphold().harEktefelleEllerBarnINorge().status).toBe(false);
    });

    test('returnerer undefined ved harEktefelleEllerBarnINorge === undefined', () => {
      const mockSkjema = {
        ektefelleEllerBarnINorge: undefined,
      };

      const regel = new Regel(mockSkjema);

      expect(regel.opphold().harEktefelleEllerBarnINorge().status).toBe(undefined);
    });

    test('returnerer undefined ved harEktefelleEllerBarnINorge === null', () => {
      const mockSkjema = {
        ektefelleEllerBarnINorge: null,
      };

      const regel = new Regel(mockSkjema);

      expect(regel.opphold().harEktefelleEllerBarnINorge().status).toBe(undefined);
    });
  });

  describe('harForutgaendeBostedINorge', () => {
    test('returnerer true ved forutgaendeBostedINorge === true', () => {
      const mockSkjema = {
        forutgaendeBostedINorge: true,
      };

      const regel = new Regel(mockSkjema);

      expect(regel.opphold().harForutgaendeBostedINorge().status).toBe(true);
    });

    test('returnerer true ved forutgaendeBostedINorge === false', () => {
      const mockSkjema = {
        forutgaendeBostedINorge: false,
      };

      const regel = new Regel(mockSkjema);

      expect(regel.opphold().harForutgaendeBostedINorge().status).toBe(false);
    });

    test('returnerer undefined ved forutgaendeBostedINorge === undefined', () => {
      const mockSkjema = {
        forutgaendeBostedINorge: undefined,
      };

      const regel = new Regel(mockSkjema);

      expect(regel.opphold().harForutgaendeBostedINorge().status).toBe(undefined);
    });

    test('returnerer undefined ved forutgaendeBostedINorge === null', () => {
      const mockSkjema = {
        forutgaendeBostedINorge: null,
      };

      const regel = new Regel(mockSkjema);

      expect(regel.opphold().harForutgaendeBostedINorge().status).toBe(undefined);
    });
  });

  describe('familieBorINorge', () => {
    test('returnerer true ved familiesBosted === "NO"', () => {
      const mockSkjema = {
        familiesBosted: 'NO',
      };

      const regel = new Regel(mockSkjema);

      expect(regel.opphold().familieBorINorge().status).toBe(true);
    });

    test('returnerer true ved familiesBosted !== "NO"', () => {
      const mockSkjema = {
        familiesBosted: 'GB',
      };

      const regel = new Regel(mockSkjema);

      expect(regel.opphold().familieBorINorge().status).toBe(false);
    });

    test('returnerer undefined ved familiesBosted === ""', () => {
      const mockSkjema = {
        familiesBosted: '',
      };

      const regel = new Regel(mockSkjema);

      expect(regel.opphold().familieBorINorge().status).toBe(undefined);
    });

    test('returnerer undefined ved familiesBosted === null', () => {
      const mockSkjema = {
        familiesBosted: null,
      };

      const regel = new Regel(mockSkjema);

      expect(regel.opphold().familieBorINorge().status).toBe(undefined);
    });
  });

  describe('harAdresseIUtlandet', () => {
    test('returnerer true ved adresseIUtlandet === true', () => {
      const mockSkjema = {
        adresseIUtlandet: true,
      };

      const regel = new Regel(mockSkjema);

      expect(regel.opphold().harAdresseIUtlandet().status).toBe(true);
    });

    test('returnerer true ved adresseIUtlandet === false', () => {
      const mockSkjema = {
        adresseIUtlandet: false,
      };

      const regel = new Regel(mockSkjema);

      expect(regel.opphold().harAdresseIUtlandet().status).toBe(false);
    });

    test('returnerer undefined ved adresseIUtlandet === undefined', () => {
      const mockSkjema = {
        adresseIUtlandet: undefined,
      };

      const regel = new Regel(mockSkjema);

      expect(regel.opphold().harAdresseIUtlandet().status).toBe(undefined);
    });

    test('returnerer undefined ved adresseIUtlandet === null', () => {
      const mockSkjema = {
        adresseIUtlandet: null,
      };

      const regel = new Regel(mockSkjema);

      expect(regel.opphold().harAdresseIUtlandet().status).toBe(undefined);
    });
  });

  describe('harIntensjonOmReturTilNorge', () => {
    test('returnerer true ved harIntensjonOmReturTilNorge === true', () => {
      const mockSkjema = {
        intensjonOmRetur: true,
      };

      const regel = new Regel(mockSkjema);

      expect(regel.opphold().harIntensjonOmReturTilNorge().status).toBe(true);
    });

    test('returnerer true ved harIntensjonOmReturTilNorge === false', () => {
      const mockSkjema = {
        intensjonOmRetur: false,
      };

      const regel = new Regel(mockSkjema);

      expect(regel.opphold().harIntensjonOmReturTilNorge().status).toBe(false);
    });

    test('returnerer undefined ved harIntensjonOmReturTilNorge === undefined', () => {
      const mockSkjema = {
        intensjonOmRetur: undefined,
      };

      const regel = new Regel(mockSkjema);

      expect(regel.opphold().harIntensjonOmReturTilNorge().status).toBe(undefined);
    });

    test('returnerer undefined ved harIntensjonOmReturTilNorge === null', () => {
      const mockSkjema = {
        intensjonOmRetur: null,
      };

      const regel = new Regel(mockSkjema);

      expect(regel.opphold().harIntensjonOmReturTilNorge().status).toBe(undefined);
    });
  });
});
