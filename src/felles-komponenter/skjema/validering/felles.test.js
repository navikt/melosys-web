/* eslint-disable */

import Felles from './felles';

const feilmeldingMock = {
  form: {
    feilmeldinger: [{
      kategori: {
        alvorlighetsgrad: 'FEIL', beskrivelse: 'Kort beskrivelse.',
      },
      alvorlighetsgrad: 'FEIL',
      beskrivelse: 'Mangler informasjon',
      melding: 'Mangler informasjon.',
      skjemaFeltID: 'antallMaanederINorge',
    }],
  },
};

describe('Tester felles.js:', () => {
  describe('inneholderFeilmeldinger', () => {
    test('returnerer true ved feilmeldinger', () => {
      expect(Felles.inneholderFeilmeldinger(feilmeldingMock)).toBe(true);
    });

    test('returnerer false hvis ingen feilmeldinger', () => {
      const mockData1 = {};
      const mockData2 = { form: {feilmeldinger: [] }};
      expect(Felles.inneholderFeilmeldinger(mockData1)).toBe(false);
      expect(Felles.inneholderFeilmeldinger(mockData2)).toBe(false);
    })
  });

  describe('byggValideringsObjekt', () => {
    test('returnerer korrekt valideringsobjekt', () => {
      const mockData = feilmeldingMock;
      const forventetData = {
        antallMaanederINorge: 'Mangler informasjon.',
      };

      expect(Felles.byggValideringsObjekt(mockData)).toEqual(forventetData);
    })
  });

  describe('flatUtFeltGrupper', () => {
    test('returnerer en falt array fra gruppefelter', () => {
      const mockData = {
        gruppe1: {
          fooFeltnavn: 'foo',
          barFeltnavn: 'bar',
        },
        gruppe2: {
          bazFeltnavn: 'baz',
          fazFeltnavn: 'faz',
        }
      };

      const forventetData = {
        fooFeltnavn: 'foo',
        barFeltnavn: 'bar',
        bazFeltnavn: 'baz',
        fazFeltnavn: 'faz'
      };

      expect(Felles.flatUtFeltGrupper(mockData)).toEqual(forventetData)
    })
  });

  describe('kjorAlleValideringerSomHarFunksjoner', () => {
    test('returnerer forventet valideringsobjekt', () => {
      const mockVerdier = {
        foo: 'foo',
        bar: 'bar'
      };

      const mockObjekt = {
        foo: verdier => `Validerer ${verdier}.`,
        bar: [verdier => `Validerer ${verdier}.`, verdier => `Husk å oppgi ${verdier}.`],
        baz: 'Baz mangler.',
        faz: 23,
      };

      const forventetObjekt = {
        foo: 'Validerer foo.',
        bar: 'Validerer bar. Husk å oppgi bar.',
        baz: 'Baz mangler.'
      };

      expect(Felles.kjorAlleValideringerSomHarFunksjoner(mockObjekt, mockVerdier, {})).toEqual(forventetObjekt)
    })
  });

  describe('flettOgFilterValidering', () => {
    test('returnerer forventet flettet valideringsobjekt', () => {
      const mockObjekt1 = {
        foo: ['Vennligst oppgi foo.'],
        bar: ['Vennligst oppgi bar.'],
      };

      const mockObjekt2 = {
        foo: ['Foo er ikke gyldig.'],
        baz: ['Vennligst oppgi baz.']
      };

      const forventetObjekt = {
        foo: 'Vennligst oppgi foo. Foo er ikke gyldig.',
        bar: 'Vennligst oppgi bar.',
        baz: 'Vennligst oppgi baz.'
      };

      expect(Felles.flettOgFilterValidering(mockObjekt1, mockObjekt2)).toEqual(forventetObjekt);
    })
  });

  describe('gyldigePaneler', () => {
    test('returnerer et objekt med gyldige panelstatuser', () => {
      const mockData = {
        familiesBosted: '(Feilmeldingen her er ikke viktig)',
        ansattPaSokkelEllerSkip: '(Feilmeldingen her er ikke viktig)',
      };

      const forventetData = {
        arbeidNorge: true,
        bosted: false,
        inntekt: true,
        oppholdUtland: true,
        bekreftelser: true,
        avklartefakta: true,
        maritimtArbeid: true,
        personOpplysninger: true,
        selvstendigArbeid: true,
      };

      expect(Felles.gyldigePaneler(mockData)).toEqual(forventetData);
    })
  })
});
