/* eslint-disable */
import * as Selectors from './selectors';

describe('test kodeverk/selectors.js', () => {
  // LandkoderSelector
  describe('landkoderSelector.js', () => {
    test('returnerer tom array ved undefined', () => {
      const mockData = {
        kodeverk: {
          data: {}
        }
      };

      const forventetResultat = [];

      expect(Selectors.landkoderSelector(mockData)).toEqual(forventetResultat);
    });

    test('returnerer forventet array av landkoder', () => {
      const mockData = {
        kodeverk: {
          data: {
            landkoder: [
              { kode: 'NO', term: 'Norge'},
              { kode: 'SE', term: 'Sverige'},
            ]
          }
        }
      };

      const forventetResultat = [
        { kode: 'NO', term: 'Norge'},
        { kode: 'SE', term: 'Sverige'},
      ];

      expect(Selectors.landkoderSelector(mockData)).toEqual(forventetResultat)
    })
  });

  // BehandlingsStatusSelector
  describe('behandlingsStatusSelector.js', () => {
    test('returnerer tom array ved undefined', () => {
      const mockData = {
        kodeverk: {
          data: {}
        }
      };

      const forventetResultat = [];

      expect(Selectors.behandlingsStatusSelector(mockData)).toEqual(forventetResultat);
    });

    test('returnerer forventet array av landkoder', () => {
      const mockData = {
        kodeverk: {
          data: {
            behandlinger: {
              behandlingsstatus: [
                { kode: 'OPPRETTET', term: 'Opprettet' },
                { kode: 'UNDER_BEHANDLING', term: 'Under behandling' },
              ]
            }
          }
        }
      };

      const forventetResultat = [
        { kode: 'OPPRETTET', term: 'Opprettet' },
        { kode: 'UNDER_BEHANDLING', term: 'Under behandling' },
      ];

      expect(Selectors.behandlingsStatusSelector(mockData)).toEqual(forventetResultat)
    })
  });

  // BehandlingsTyperSelector
  describe('behandlingsTyperSelector.js', () => {
    test('returnerer tom array ved undefined', () => {
      const mockData = {
        kodeverk: {
          data: {}
        }
      };

      const forventetResultat = [];

      expect(Selectors.behandlingsTyperSelector(mockData)).toEqual(forventetResultat);
    });

    test('returnerer forventet array av landkoder', () => {
      const mockData = {
        kodeverk: {
          data: {
            behandlinger: {
              behandlingstyper: [
                { kode: 'SOEKNAD', term: 'Søknad' },
                { kode: 'UNNTAK_FRA_MEDLEMSKAP', term: 'Unntak medlemskap' },
              ]
            }
          }
        }
      };

      const forventetResultat = [
        { kode: 'SOEKNAD', term: 'Søknad' },
        { kode: 'UNNTAK_FRA_MEDLEMSKAP', term: 'Unntak medlemskap' },
      ];

      expect(Selectors.behandlingsTyperSelector(mockData)).toEqual(forventetResultat)
    })
  });

  // SakstyperSelector
  describe('sakstyperSelector.js', () => {
    test('returnerer tom array ved undefined', () => {
      const mockData = {
        kodeverk: {
          data: {}
        }
      };

      const forventetResultat = [];

      expect(Selectors.sakstyperSelector(mockData)).toEqual(forventetResultat);
    });

    test('returnerer forventet array av landkoder', () => {
      const mockData = {
        kodeverk: {
          data: {
            sakstyper: [
              { kode: 'EU_EOS', term: 'EU/EØS' },
              { kode: 'TRYGDEAVTALE', term: 'Trygdeavtale' },
            ]
          }
        }
      };

      const forventetResultat = [
        { kode: 'EU_EOS', term: 'EU/EØS' },
        { kode: 'TRYGDEAVTALE', term: 'Trygdeavtale' },
      ];

      expect(Selectors.sakstyperSelector(mockData)).toEqual(forventetResultat)
    })
  });

  // DokmentTitlerSelector
  describe('dokumenttitlerSelector.js', () => {
    test('returnerer tom array ved undefined', () => {
      const mockData = {
        kodeverk: {
          data: {}
        }
      };

      const forventetResultat = [];

      expect(Selectors.dokumenttitlerSelector(mockData)).toEqual(forventetResultat);
    });

    test('returnerer forventet array av landkoder', () => {
      const mockData = {
        kodeverk: {
          data: {
            dokumenttitler: [
              { kode:'ARBF', term:'Arbeidsforhold'},
              { kode:'BKR_MEDL', term:'Bekreftelse på medlemskap i folketrygden' },
            ]
          }
        }
      };

      const forventetResultat = [
        { kode:'ARBF', term:'Arbeidsforhold'},
        { kode:'BKR_MEDL', term:'Bekreftelse på medlemskap i folketrygden' },
      ];

      expect(Selectors.dokumenttitlerSelector(mockData)).toEqual(forventetResultat)
    })
  })
});
