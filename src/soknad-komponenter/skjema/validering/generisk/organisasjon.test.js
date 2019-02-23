/* eslint-disable */
import * as Organisasjon from './organisasjon';


describe('Tester organisasjon.js:', () => {
  describe('erOrgnrLengde', () => {
    test('returnerer false dersom orgnr er kortere enn 9 tall', () => {
      const mockData = '12345678';
      const forventetResultat = false;
      expect(Organisasjon.erOrgnrLengde(mockData)).toEqual(forventetResultat);
    });

    test('returnerer false dersom orgnr er lengre enn 9 tall', () => {
      const mockData = '1234567890';
      const forventetResultat = false;
      expect(Organisasjon.erOrgnrLengde(mockData)).toEqual(forventetResultat);
    });

    test('returnerer true dersom orgnr er enn 9 tall', () => {
      const mockData = '123456789';
      const forventetResultat = true;
      expect(Organisasjon.erOrgnrLengde(mockData)).toEqual(forventetResultat);
    })
  });

  describe('erOrgnrGyldig', () => {
    test('returnerer false dersom orgnr ikke er gyldig', () => {
      const mockData = '123456789';
      const forventetResulat = false;
      expect(Organisasjon.erOrgnrGyldig(mockData)).toEqual(forventetResulat);
    })
  });

  describe('erOrgnrGyldig', () => {
    test('returnerer true dersom orgnr ikke er gyldig', () => {
      const mockData1 = '810072512'; //Eiken og Torsken
      const mockData2 = '910099035'; //Skarsvåg og Vanse
      const mockData3 = '910104004'; //Granvind og Fedje
      const mockData4 = '910108239'; //Stord og Leknes
      const forventetResultat = true;
      expect(Organisasjon.erOrgnrGyldig(mockData1)).toEqual(forventetResultat);
      expect(Organisasjon.erOrgnrGyldig(mockData2)).toEqual(forventetResultat);
      expect(Organisasjon.erOrgnrGyldig(mockData3)).toEqual(forventetResultat);
      expect(Organisasjon.erOrgnrGyldig(mockData4)).toEqual(forventetResultat);
    })
  })
});
