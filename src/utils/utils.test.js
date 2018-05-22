/* eslint-disable */
import { fn, isJSON } from './utils';

function foo () {
}

describe('Tester utils.js:', () => {
  describe('Tester at fn', () => {
    test('validerer et argument som en funksjon.', () => {
      expect(fn(foo)).toBe(foo);
    });
  });

  describe('Tester at isJSON', () => {
    test('validerer stringified json som true', () => {
      const testString = '{}';
      expect(isJSON(testString)).toEqual(true);
    });

    test('validerer en ikke-json-string false', () => {
      const testString = 'dette er ikke en json';
      expect(isJSON(testString)).toEqual(false);
    });

    test('validerer tomt object literal som false', () => {
      const testObjekt = {};
      expect(isJSON(testObjekt)).toEqual(false);
    });
  })
});
