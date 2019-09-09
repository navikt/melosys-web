/* eslint-disable */
import {fn, isJSON, queryParamsTilObjekt, finnVerdierMedKey } from './utils';

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

  describe('finnVerdierMedKey', () => {
    it('returnerer en tom array dersom objekt er falsy', () => {
      expect(finnVerdierMedKey(null)).toEqual([]);
    });

    it('ignorerer falsy verdier', () => {
      expect(finnVerdierMedKey({ panel: null }, 'panel')).toEqual([]);
      expect(finnVerdierMedKey({ panel: undefined }, 'panel')).toEqual([]);
      expect(finnVerdierMedKey({ panel: '' }, 'panel')).toEqual([]);
      expect(finnVerdierMedKey({ panel: 0 }, 'panel')).toEqual([]);
      expect(finnVerdierMedKey({ panel: NaN }, 'panel')).toEqual([]);
      expect(finnVerdierMedKey({ panel: false }, 'panel')).toEqual([]);
    });

    it('returnerer en tom array hvis key ikke finnes', () => {
      expect(finnVerdierMedKey({
        foretakUtland: 'foretakUtland',
        arbeidUtland: 'arbeidUtland',
      }, 'inntekt')).toEqual([]);
    })

    it('returnerer korrekt verdi for en array', () => {
      expect(finnVerdierMedKey([
        {
          arbeidUtland: [
            { panel: 'arbeidUtlandPanel' },
          ],
        },
      ], 'panel')).toEqual(['arbeidUtlandPanel']);
    });

    it('returnerer korrekt verdi for et objekt', () => {
      expect(finnVerdierMedKey({
        oppgittAdresse: {
          gatenavn: {
            panel: 'personinfoPanel' },
        },
      }, 'panel')).toEqual(['personinfoPanel']);
    });
  });
});
