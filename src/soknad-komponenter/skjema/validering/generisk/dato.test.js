/* eslint-disable */
import * as Dato from './dato';

describe('tester dato.js', () => {
  describe('datoErGyldig', () => {
    test('returnerer false ved ugyldig dato', () => {
      const mockData1 = '31/02/18';
      const mockData2 = '01/13/18';
      const forventetResultat = false;
      expect(Dato.datoErGyldig(mockData1)).toEqual(forventetResultat);
      expect(Dato.datoErGyldig(mockData2)).toEqual(forventetResultat);
    });

    test('returnerer true ved gyldig dato', () => {
      const mockData1 = '01/01/18';
      const mockData2 = '30/12/2018';
      const forventetResultat = true;
      expect(Dato.datoErGyldig(mockData1)).toEqual(forventetResultat);
      expect(Dato.datoErGyldig(mockData2)).toEqual(forventetResultat);
    })
  })
});
