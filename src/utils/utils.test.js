/* eslint-disable */
import {fn, isJSON, queryParamsTilObjekt, grupperEtterKey } from './utils';

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

  describe('queryParamsTilObjekt', () => {
    test('Dekonstruerer querystring til object med props fra querystring', () => {
      const url = '?id=1&bid=2&sid=3';
      const resultat = {
        id: '1',
        bid: '2',
        sid: '3'
      }
      expect(queryParamsTilObjekt(url)).toEqual(resultat);
    });
  });

  describe('grupperEtterKey', () => {
    it('returnerer en funksjon', () => {
      expect(grupperEtterKey([])).toBeInstanceOf(Function);
    });

    describe('funksjonen', () => {
      it('grupperer elementene i en array etter en key', () => {
        const f = grupperEtterKey('dag');
        const array = [
          { dag: 'mandag', nummer: '1' },
          { dag: 'tirsdag', nummer: '2' },
          { dag: 'mandag', nummer: '3' },
          { dag: 'tirsdag', nummer: '4' },
        ];

        expect(f(array)).toEqual({
          mandag: [
            { dag: 'mandag', nummer: '1' },
            { dag: 'mandag', nummer: '3' },
          ],
          tirsdag: [
            { dag: 'tirsdag', nummer: '2' },
            { dag: 'tirsdag', nummer: '4' },
          ],
        });
      });
    });
  });
});
