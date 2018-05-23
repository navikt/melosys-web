/* eslint-disable */

import { vaskInputDato, normaliserInputDato, formatterDatoTilNorsk, formatterDatoTilISO, formatterKortDatoTilNorsk } from './dato';

import MockDate from 'mockdate';
import moment from 'moment/moment'

moment.updateLocale('nb', {
  monthsShort: [
    'jan',
    'feb',
    'mar',
    'apr',
    'mai',
    'jun',
    'jul',
    'aug',
    'sep',
    'okt',
    'nov',
    'des',
  ],
});

describe('Tester dato.js:', () => {
  describe('Test at vaskInputDato', () => {
    test('godtar alle tillatte kortdatoformater', () => {
      const tillatteDatoer = [
        {test: '010113', 'forvent': '01.01.2013'},
        {test: '300113', 'forvent': '30.01.2013'},
        {test: '010479', 'forvent': '01.04.1979'},
        {test: '260479', 'forvent': '26.04.1979'},
        {test: '26041979', 'forvent': '26.04.1979'},
        {test: '26-04-79', 'forvent': '26.04.1979'},
        {test: '01-01-79', 'forvent': '01.01.1979'},
        {test: '26-04-1979', 'forvent': '26.04.1979'},
       ];

      tillatteDatoer.forEach(datoTest => {
        const vasketDato = vaskInputDato(datoTest.test);
        expect(vasketDato).toEqual(datoTest.forvent);
      })
    });

    test('feiler på alle ugyldige datoformater', () => {
      const galeDatoer = [
        {test: '1979-07-02', 'forvent': false},
        {test: '29-02-17', 'forvent': false},
        {test: 123456789, 'forvent': false},
        {test: 'abcdef', 'forvent': false},
        {test: undefined, 'forvent': false},
        {test: null, 'forvent': false},
      ];

      galeDatoer.forEach(datoTest => {
        const vasketDato = vaskInputDato(datoTest.test);
        expect(vasketDato).toEqual(datoTest.forvent);
      })
    });

    test('feiler hvis dato er mindre enn 6 tegn', () => {
      const galDato = '26479';
      const vasketDato = vaskInputDato(galDato);
      expect(vasketDato).toEqual(false);
    });

    test('tolker årstall med 2 siffer til riktig århundre', () => {
      MockDate.set('1/1/2010');

      const testDatoer = [
        {test: '26-04-20', 'forvent': '26.04.2020'},
        {test: '26-04-30', 'forvent': '26.04.1930'},
      ];

      testDatoer.forEach(datoTest => {
        const vasketDato = vaskInputDato(datoTest.test);
        expect(vasketDato).toEqual(datoTest.forvent);
      });
    });
  })

  describe('Tester at nodmaliserInputDato', () => {
    test('ikke forsøker å vaske datoen så lenge verdiene er forskjellige', () => {
      const verdi = '123456';
      const forrigeVerdi = '12345';

      expect(normaliserInputDato(verdi, forrigeVerdi)).toEqual(verdi);
    });

    test('vasker datoen når verdiene er like', () => {
      const verdi = '011217';
      const forrigeVerdi = '011217';

      expect(normaliserInputDato(verdi, forrigeVerdi)).not.toEqual(false);
    });
  })

  describe('Tester at formatterDatoTilNorsk', () => {
    test('formatterer datoen riktig til norsk format DD.MM.YYYY uten klokkeslett', () => {
      const tillatteDatoer = [
        {test: '2016-01-12', 'forvent': '12.01.2016'},
        {test: '2017-12-01T20:58:01', 'forvent': '01.12.2017'},
        {test: '01.02.1979', 'forvent': '01.02.1979'},
        {test: '01.02.1979', 'forvent': '01.02.1979'},
      ];

      tillatteDatoer.forEach(datoTest => {
        const formattertDato = formatterDatoTilNorsk(datoTest.test);
        expect(formattertDato).toEqual(datoTest.forvent);
      });
    })

    test('returnerer tom streng dersom datoen er ugyldig.', () => {
      const feilDato = '2018-april-31';
      const formattertDato = formatterDatoTilNorsk(feilDato);
      expect(formattertDato).toEqual('');
    })

    test('formatterer datoen riktig til norsk format DD.MM.YYYY HH:mm:ss med klokkeslett', () => {
      const tillatteDatoer = [
        {test: '2017-12-01T20:58:01', 'forvent': '01.12.2017 20:58'},
        {test: '2017-12-01T01:08:01', 'forvent': '01.12.2017 01:08'},
        {test: '12.02.2000 20:00:1', 'forvent': '12.02.2000 20:00'},
      ];

      tillatteDatoer.forEach(datoTest => {
        const formattertDato = formatterDatoTilNorsk(datoTest.test, true);
        expect(formattertDato).toEqual(datoTest.forvent);
      });
    })
  });


  describe('Tester at formatterDatoTilISO', () => {
    test('formatterer dato uten klokkeslett til ISO-format.', () => {
      const tillatteDatoer = [
        {test: '01.01.2018', forvent: '2018-01-01'},
        {test: '10.12.2018', forvent: '2018-12-10'}
      ]

      tillatteDatoer.forEach(datoTest => {
        const formattertDato = formatterDatoTilISO(datoTest.test, false);
        expect(formattertDato).toEqual(datoTest.forvent);
      });
    })

    test('formatterer dato med klokkeslett til ISO-format.', () => {
      const tillatteDatoer = [
        {test: '01.01.2018 10:34', forvent: '2018-01-01T10:34:00'},
        {test: '10.12.2018 10:34', forvent: '2018-12-10T10:34:00'},
      ]

      tillatteDatoer.forEach(datoTest => {
        const formattertDato = formatterDatoTilISO(datoTest.test, true);
        expect(formattertDato).toEqual(datoTest.forvent);
      });
    })
  })

  describe('Tester at formatterKortDatoTilNorsk', () => {
    test('formatterer år-dato til korrekt til lesbarhet', () => {
      const tillatteDatoer = [
        {test: '2007-01', forvent: 'jan - 2007'},
        {test: '2014-05', forvent: 'mai - 2014'},
        {test: '2016-10-31', forvent: 'okt - 2016'},
      ]

      tillatteDatoer.forEach(datoTest => {
        const formattertDato = formatterKortDatoTilNorsk(datoTest.test);
        expect(formattertDato).toEqual(datoTest.forvent);
      });
    });
  })

});
