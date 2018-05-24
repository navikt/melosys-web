/* eslint-disable */
import { fn, isJSON, storeForbokstaver } from './utils';

describe('utils.js:', () => {

  describe('fn', () => {
    test('parser et funksjonsargument som funksjon.', () => {
      function foo () {}
      expect(fn(foo)).toBe(foo);
    });
  });

  describe('isJSON', () => {
    test('validerer stringified json som true', () => {
      const testString = '{}';
      expect(isJSON(testString)).toEqual(true);
    });

    test('validerer en ikke-json-string som false', () => {
      const testString = 'dette er ikke en json';
      expect(isJSON(testString)).toEqual(false);
    });

    test('validerer tomt object literal som false', () => {
      const testObjekt = {};
      expect(isJSON(testObjekt)).toEqual(false);
    });
  });

  describe('storeForbokstaver', () => {
    test('Oppdaterer forste bokstav i hvert ord i setningen med stor bokstav', () => {
      const testString = 'en to tre fire fem';
      expect(storeForbokstaver(testString)).toEqual('En To Tre Fire Fem');
    });
  });
});
