/* eslint-disable */
import * as Selectors from './selectors';

describe('test kodeverk/selectors.js', () => {
  describe('landkoderSelector.js', () => {
    test('returnerer tom array ved undefined', () => {
      const mockData = {
        kodeverk: {
          data: {}
        }
      }

      const forventetResultat = [];

      expect(Selectors.landkoderSelector(mockData)).toEqual(forventetResultat);
    })

    test('returnerer forventet array av landkoder', () => {
      const mockData = {
        kodeverk: {
          data: {
            landkoder: [
              { kode: 'NO', term: 'Norge'},
              { kode: 'SE', term: 'Sverige'},
              { kode: 'DK', term: 'Danmark'},
            ]
          }
        }
      }

      const forventetResultat = [
        { kode: 'NO', term: 'Norge'},
        { kode: 'SE', term: 'Sverige'},
        { kode: 'DK', term: 'Danmark'},
      ];

      expect(Selectors.landkoderSelector(mockData)).toEqual(forventetResultat)
    })

  })
})
