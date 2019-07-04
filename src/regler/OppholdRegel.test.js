import OppholdRegel from './OppholdRegel';

describe('Tester at regler for opphold', () => {
  describe('inntilTolvManeder', () => {
    test('returnerer true ved 12 mnd', () => {
      const mockSkjema = {
        oppholdUtlandFom: '01.01.2018',
        oppholdUtlandTom: '31.12.2018',
      };

      const oppholdRegel = new OppholdRegel(mockSkjema);

      expect(oppholdRegel.inntilTolvMaaneder().status).toBe(true);
    });

    test('returnerer false ved mer enn 12 mnd', () => {
      const mockSkjema = {
        oppholdUtlandFom: '01.01.2018',
        oppholdUtlandTom: '04.01.2019',
      };

      const oppholdRegel = new OppholdRegel(mockSkjema);

      expect(oppholdRegel.inntilTolvMaaneder().status).toBe(false);
    });

    test('returnerer undefined ved ingen eller ukurant dato', () => {
      const mockSkjema = {
        oppholdUtlandFom: '',
        oppholdUtlandTom: null,
      };

      const oppholdRegel = new OppholdRegel(mockSkjema);

      expect(oppholdRegel.inntilTolvMaaneder().status).toBe(undefined);
    });
  });

  describe('erINorgeSeksManederEllerMerPerKalenderAr', () => {
    test('returnerer true ved 6 måneder.', () => {
      const mockSkjema = {
        antallMaanederINorge: 6,
      };

      const oppholdRegel = new OppholdRegel(mockSkjema);

      expect(oppholdRegel.erINorgeSeksManederEllerMerPerKalenderAr().status).toBe(true);
    });

    test('returnerer false ved 5 måneder.', () => {
      const mockSkjema = {
        antallMaanederINorge: 5,
      };

      const oppholdRegel = new OppholdRegel(mockSkjema);

      expect(oppholdRegel.erINorgeSeksManederEllerMerPerKalenderAr().status).toBe(false);
    });
  });

  describe('oppholderSegIUtlandet', () => {
    test('returnerer true ved avklartefaktaOppholdsLand != "NO"', () => {
      const mockSkjema = {
        avklartefaktaOppholdsLand: ['GB'],
      };

      const oppholdRegel = new OppholdRegel(mockSkjema);

      expect(oppholdRegel.oppholderSegIUtlandet().status).toBe(true);
    });

    test('returnerer true ved avklartefaktaOppholdsLand === "NO"', () => {
      const mockSkjema = {
        avklartefaktaOppholdsLand: ['NO'],
      };

      const oppholdRegel = new OppholdRegel(mockSkjema);

      expect(oppholdRegel.oppholderSegIUtlandet().status).toBe(false);
    });

    test('returnerer undefined ved avklartefaktaOppholdsLand === []', () => {
      const mockSkjema = {
        avklartefaktaOppholdsLand: [],
      };

      const oppholdRegel = new OppholdRegel(mockSkjema);

      expect(oppholdRegel.oppholderSegIUtlandet().status).toBe(undefined);
    });

    test('returnerer undefined ved avklartefaktaOppholdsLand === null', () => {
      const mockSkjema = {
        avklartefaktaOppholdsLand: null,
      };

      const oppholdRegel = new OppholdRegel(mockSkjema);

      expect(oppholdRegel.oppholderSegIUtlandet().status).toBe(undefined);
    });

    test('returnerer undefined ved avklartefaktaOppholdsLand === undefined', () => {
      const mockSkjema = {
        avklartefaktaOppholdsLand: undefined,
      };

      const oppholdRegel = new OppholdRegel(mockSkjema);

      expect(oppholdRegel.oppholderSegIUtlandet().status).toBe(undefined);
    });
  });

  describe('harSammeAdresseSomArbeidsgiver', () => {
    test('returnerer true ved sammeAdresseSomArbeidsgiver === true', () => {
      const mockSkjema = {
        sammeAdresseSomArbeidsgiver: true,
      };

      const oppholdRegel = new OppholdRegel(mockSkjema);

      expect(oppholdRegel.harSammeAdresseSomArbeidsgiver().status).toBe(true);
    });

    test('returnerer true ved sammeAdresseSomArbeidsgiver === false', () => {
      const mockSkjema = {
        sammeAdresseSomArbeidsgiver: false,
      };

      const oppholdRegel = new OppholdRegel(mockSkjema);

      expect(oppholdRegel.harSammeAdresseSomArbeidsgiver().status).toBe(false);
    });

    test('returnerer undefined ved sammeAdresseSomArbeidsgiver === undefined', () => {
      const mockSkjema = {
        sammeAdresseSomArbeidsgiver: undefined,
      };

      const oppholdRegel = new OppholdRegel(mockSkjema);

      expect(oppholdRegel.harSammeAdresseSomArbeidsgiver().status).toBe(undefined);
    });

    test('returnerer undefined ved sammeAdresseSomArbeidsgiver === null', () => {
      const mockSkjema = {
        sammeAdresseSomArbeidsgiver: null,
      };

      const oppholdRegel = new OppholdRegel(mockSkjema);

      expect(oppholdRegel.harSammeAdresseSomArbeidsgiver().status).toBe(undefined);
    });
  });

  describe('harEktefelleEllerBarnINorge', () => {
    test('returnerer true ved harEktefelleEllerBarnINorge === true', () => {
      const mockSkjema = {
        ektefelleEllerBarnINorge: true,
      };

      const oppholdRegel = new OppholdRegel(mockSkjema);

      expect(oppholdRegel.harEktefelleEllerBarnINorge().status).toBe(true);
    });

    test('returnerer true ved harEktefelleEllerBarnINorge === false', () => {
      const mockSkjema = {
        ektefelleEllerBarnINorge: false,
      };

      const oppholdRegel = new OppholdRegel(mockSkjema);

      expect(oppholdRegel.harEktefelleEllerBarnINorge().status).toBe(false);
    });

    test('returnerer undefined ved harEktefelleEllerBarnINorge === undefined', () => {
      const mockSkjema = {
        ektefelleEllerBarnINorge: undefined,
      };

      const oppholdRegel = new OppholdRegel(mockSkjema);

      expect(oppholdRegel.harEktefelleEllerBarnINorge().status).toBe(undefined);
    });

    test('returnerer undefined ved harEktefelleEllerBarnINorge === null', () => {
      const mockSkjema = {
        ektefelleEllerBarnINorge: null,
      };

      const oppholdRegel = new OppholdRegel(mockSkjema);

      expect(oppholdRegel.harEktefelleEllerBarnINorge().status).toBe(undefined);
    });
  });

  describe('harForutgaendeBostedINorge', () => {
    test('returnerer true ved forutgaendeBostedINorge === true', () => {
      const mockSkjema = {
        forutgaendeBostedINorge: true,
      };

      const oppholdRegel = new OppholdRegel(mockSkjema);

      expect(oppholdRegel.harForutgaendeBostedINorge().status).toBe(true);
    });

    test('returnerer true ved forutgaendeBostedINorge === false', () => {
      const mockSkjema = {
        forutgaendeBostedINorge: false,
      };

      const oppholdRegel = new OppholdRegel(mockSkjema);

      expect(oppholdRegel.harForutgaendeBostedINorge().status).toBe(false);
    });

    test('returnerer undefined ved forutgaendeBostedINorge === undefined', () => {
      const mockSkjema = {
        forutgaendeBostedINorge: undefined,
      };

      const oppholdRegel = new OppholdRegel(mockSkjema);

      expect(oppholdRegel.harForutgaendeBostedINorge().status).toBe(undefined);
    });

    test('returnerer undefined ved forutgaendeBostedINorge === null', () => {
      const mockSkjema = {
        forutgaendeBostedINorge: null,
      };

      const oppholdRegel = new OppholdRegel(mockSkjema);

      expect(oppholdRegel.harForutgaendeBostedINorge().status).toBe(undefined);
    });
  });

  describe('familieBorINorge', () => {
    test('returnerer true ved familiesBosted === "NO"', () => {
      const mockSkjema = {
        familiesBosted: 'NO',
      };

      const oppholdRegel = new OppholdRegel(mockSkjema);

      expect(oppholdRegel.familieBorINorge().status).toBe(true);
    });

    test('returnerer true ved familiesBosted !== "NO"', () => {
      const mockSkjema = {
        familiesBosted: 'GB',
      };

      const oppholdRegel = new OppholdRegel(mockSkjema);

      expect(oppholdRegel.familieBorINorge().status).toBe(false);
    });

    test('returnerer undefined ved familiesBosted === ""', () => {
      const mockSkjema = {
        familiesBosted: '',
      };

      const oppholdRegel = new OppholdRegel(mockSkjema);

      expect(oppholdRegel.familieBorINorge().status).toBe(undefined);
    });

    test('returnerer undefined ved familiesBosted === null', () => {
      const mockSkjema = {
        familiesBosted: null,
      };

      const oppholdRegel = new OppholdRegel(mockSkjema);

      expect(oppholdRegel.familieBorINorge().status).toBe(undefined);
    });
  });

  describe('harAdresseIUtlandet', () => {
    test('returnerer true ved adresseIUtlandet === true', () => {
      const mockSkjema = {
        adresseIUtlandet: true,
      };

      const oppholdRegel = new OppholdRegel(mockSkjema);

      expect(oppholdRegel.harAdresseIUtlandet().status).toBe(true);
    });

    test('returnerer true ved adresseIUtlandet === false', () => {
      const mockSkjema = {
        adresseIUtlandet: false,
      };

      const oppholdRegel = new OppholdRegel(mockSkjema);

      expect(oppholdRegel.harAdresseIUtlandet().status).toBe(false);
    });

    test('returnerer undefined ved adresseIUtlandet === undefined', () => {
      const mockSkjema = {
        adresseIUtlandet: undefined,
      };

      const oppholdRegel = new OppholdRegel(mockSkjema);

      expect(oppholdRegel.harAdresseIUtlandet().status).toBe(undefined);
    });

    test('returnerer undefined ved adresseIUtlandet === null', () => {
      const mockSkjema = {
        adresseIUtlandet: null,
      };

      const oppholdRegel = new OppholdRegel(mockSkjema);

      expect(oppholdRegel.harAdresseIUtlandet().status).toBe(undefined);
    });
  });

  describe('harIntensjonOmReturTilNorge', () => {
    test('returnerer true ved harIntensjonOmReturTilNorge === true', () => {
      const mockSkjema = {
        intensjonOmRetur: true,
      };

      const oppholdRegel = new OppholdRegel(mockSkjema);

      expect(oppholdRegel.harIntensjonOmReturTilNorge().status).toBe(true);
    });

    test('returnerer true ved harIntensjonOmReturTilNorge === false', () => {
      const mockSkjema = {
        intensjonOmRetur: false,
      };

      const oppholdRegel = new OppholdRegel(mockSkjema);

      expect(oppholdRegel.harIntensjonOmReturTilNorge().status).toBe(false);
    });

    test('returnerer undefined ved harIntensjonOmReturTilNorge === undefined', () => {
      const mockSkjema = {
        intensjonOmRetur: undefined,
      };

      const oppholdRegel = new OppholdRegel(mockSkjema);

      expect(oppholdRegel.harIntensjonOmReturTilNorge().status).toBe(undefined);
    });

    test('returnerer undefined ved harIntensjonOmReturTilNorge === null', () => {
      const mockSkjema = {
        intensjonOmRetur: null,
      };

      const oppholdRegel = new OppholdRegel(mockSkjema);

      expect(oppholdRegel.harIntensjonOmReturTilNorge().status).toBe(undefined);
    });
  });
});
