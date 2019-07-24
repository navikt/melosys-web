/* eslint-disable */
import * as Adresse from './adresse';

describe('tester adresse.js', () => {
  describe('adresseKreves', () => {
    test('returnerer korrekt feilmelding ved ugyldig adresse', () => {
      const mockData1 = '';
      const mockData2 = undefined;
      const mockData3 = null;
      const forventetResultat = 'Vær snill å taste inn adressen.';
      expect(Adresse.adresseKreves(mockData1)).toEqual(forventetResultat);
      expect(Adresse.adresseKreves(mockData2)).toEqual(forventetResultat);
      expect(Adresse.adresseKreves(mockData3)).toEqual(forventetResultat);
    });

    test('returnerer null ved gyldig adresse', () => {
      const mockData = 'Adresseveien 123';
      const forventetResultat = null;
      expect(Adresse.adresseKreves(mockData)).toEqual(forventetResultat);
    })
  });

  describe('norskPostNummer', () => {
    test('returnerer korrekt feilmelding ved ugyldig postnr', () => {
      const mockData1 = '12345';
      const mockData2 = '123';
      const forventetResultat = 'Postnummeret ser ikke ut til å stemme.';
      expect(Adresse.norskPostNummer(mockData1)).toEqual(forventetResultat);
      expect(Adresse.norskPostNummer(mockData2)).toEqual(forventetResultat);
    });

    test('returnerer null ved gyldig postnr', () => {
      const mockData1 = '0123';
      const mockData2 = 2312;
      const forventetResultat = null;
      expect(Adresse.norskPostNummer(mockData1)).toEqual(forventetResultat);
      expect(Adresse.norskPostNummer(mockData2)).toEqual(forventetResultat);
    })
  })
});
