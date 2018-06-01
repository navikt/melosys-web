/* eslint-disable */

import {__private__} from './felles';

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
      const mockData = feilmeldingMock;
      expect(__private__.inneholderFeilmeldinger(mockData)).toBe(true);
    })

    test('returnerer false hvis ingen feilmeldinger', () => {
      const mockData1 = {};
      const mockData2 = { form: {feilmeldinger: [] }}
      expect(__private__.inneholderFeilmeldinger(mockData1)).toBe(false);
      expect(__private__.inneholderFeilmeldinger(mockData2)).toBe(false);
    })
  })

  describe('byggValideringsObjekt', () => {
    test('returnerer korrekt valideringsobjekt', () => {
      const mockData = feilmeldingMock;
      const forventetData = {
        antallMaanederINorge: 'Mangler informasjon.',
      }

      expect(__private__.byggValideringsObjekt(mockData)).toEqual(forventetData);
    })
  })

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
      }

      const forventetData = {
        fooFeltnavn: 'foo',
        barFeltnavn: 'bar',
        bazFeltnavn: 'baz',
        fazFeltnavn: 'faz'
      }

      expect(__private__.flatUtFeltGrupper(mockData)).toEqual(forventetData)
    })
  })

  describe('gyldigePaneler', () => {
    test('returnerer et objekt med gyldige panelstatuser', () => {
      const mockData = {
        familiesBosted: '',
        ansattPaSokkelEllerSkip: '',
      }
    })
  })

})
