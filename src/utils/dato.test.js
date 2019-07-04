/* eslint-disable */

import { vaskInputDato, normaliserInputDato, formatterDatoTilNorsk, formatterDatoTilISO, formatterKortDatoTilNorsk, datoDiff, datoDiffMenneskelig, beregnAlder } from './dato';

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

describe('dato.js:', () => {
  describe('vaskInputDato', () => {
    test('godtar alle tillatte kortdatoformater', () => {
      const tillatteDatoer = [
        {test: '010113', 'forvent': '01.01.2013'},
        {test: '300113', 'forvent': '30.01.2013'},
        {test: '010479', 'forvent': '01.04.1979'},
        {test: '260479', 'forvent': '26.04.1979'},
        {test: '26041979', 'forvent': '26.04.1979'},
        {test: '22.07.09', 'forvent': '22.07.2009'},
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
  });

  describe('nodmaliserInputDato', () => {
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
  });

  describe('formatterDatoTilNorsk', () => {
    test('formatterer datoen riktig til norsk format DD.MM.YYYY uten klokkeslett', () => {
      const tillatteDatoer = [
        {test: '2016-01-12', 'forvent': '12.01.2016'},
        {test: '2017-12-01T20:58:01Z', 'forvent': '01.12.2017'},
        {test: '01.02.1979', 'forvent': '01.02.1979'},
        {test: '01.02.1979', 'forvent': '01.02.1979'},
      ];

      tillatteDatoer.forEach(datoTest => {
        const formattertDato = formatterDatoTilNorsk(datoTest.test);
        expect(formattertDato).toEqual(datoTest.forvent);
      });
    });

    test('returnerer tom streng dersom datoen er ugyldig.', () => {
      const feilDato = '2018-april-31';
      const formattertDato = formatterDatoTilNorsk(feilDato);
      expect(formattertDato).toEqual('');
    });

    test('formatterer datoen riktig til norsk format DD.MM.YYYY HH:mm:ss med klokkeslett', () => {
      const tillatteDatoer = [
        {test: '2017-12-01T20:58:01Z', 'forvent': '01.12.2017 21:58'},
        {test: '2017-12-01T01:08:01Z', 'forvent': '01.12.2017 02:08'},
        {test: '12.02.2000 20:00:1Z', 'forvent': '12.02.2000 21:00'},
      ];

      tillatteDatoer.forEach(datoTest => {
        const formattertDato = formatterDatoTilNorsk(datoTest.test, true);
        expect(formattertDato).toEqual(datoTest.forvent);
      });
    })
  });


  describe('formatterDatoTilISO', () => {
    test('formatterer dato uten klokkeslett til ISO-format.', () => {
      const tillatteDatoer = [
        {test: '01.01.2018', forvent: '2018-01-01'},
        {test: '10.12.2018', forvent: '2018-12-10'}
      ];

      tillatteDatoer.forEach(datoTest => {
        const formattertDato = formatterDatoTilISO(datoTest.test, false);
        expect(formattertDato).toEqual(datoTest.forvent);
      });
    });

    test('formatterer dato med klokkeslett til ISO-format.', () => {
      const tillatteDatoer = [
        {test: '01.01.2018 10:34', forvent: '2018-01-01T10:34:00'},
        {test: '10.12.2018 10:34', forvent: '2018-12-10T10:34:00'},
      ];

      tillatteDatoer.forEach(datoTest => {
        const formattertDato = formatterDatoTilISO(datoTest.test, true);
        expect(formattertDato).toEqual(datoTest.forvent);
      });
    })
  });

  describe('formatterKortDatoTilNorsk', () => {
    test('formatterer år-dato til korrekt til lesbarhet', () => {
      const tillatteDatoer = [
        {test: '2007-01', forvent: 'jan - 2007'},
        {test: '2014-05', forvent: 'mai - 2014'},
        {test: '2016-10-31', forvent: 'okt - 2016'},
      ];

      tillatteDatoer.forEach(datoTest => {
        const formattertDato = formatterKortDatoTilNorsk(datoTest.test);
        expect(formattertDato).toEqual(datoTest.forvent);
      });
    });
  });

  describe('datodiff', () => {
    test('tidligere dato diffet på kommende dato gir positivt tall', () => {
      const dato1 = '2018-01-01';
      const dato2 = '2018-05-05';
      expect(datoDiff(dato1, dato2, 'days')).toBeGreaterThan(0);
    });

    test('kommende dato diffet på eldre dato gir negativt tall', () => {
      const dato1 = '2018-01-01';
      const dato2 = '2010-05-05';
      expect(datoDiff(dato1, dato2, 'days')).toBeLessThan(0);
    });

    test('en dato diffet på datoen for neste dag gir 1', () => {
      const dato1 = '2018-01-01';
      const dato2 = '2018-01-02';
      expect(datoDiff(dato1, dato2, 'days')).toBe(2);
    });

    test('dato i moment-format fungerer', () => {
      const dato1 = '2018-08-01';
      const dato2 = moment('2018-08-04', 'YYYY-MM-DD');
      expect(datoDiff(dato1, dato2, 'days')).toBe(4);
    });

    test('mindre enn én måned gir desimaltall', () => {
      const dato1 = '2018-01-01';
      const dato2 = '2018-01-31';
      expect(datoDiff(dato1, dato2, 'months')).toBe(1);
    });

    test('Nøyaktig 6 måneder', () => {
      const dato1 = '2016-02-26';
      const dato2 = '2016-08-25';
      expect(datoDiff(dato1, dato2, 'months')).toBe(6);
    })
  });

  describe('beregn forskjell i måneder og dager', () => {
    test('forskjell er 12 måned og 1 dag', () => {
      const dato1 = '2018-01-01';
      const dato2 = '2019-01-01';

      expect(datoDiffMenneskelig(dato1, dato2)).toBe('12 måneder og 1 dag');
    });

    test('forskjell er 12 måned', () => {
      const dato1 = '2018-01-01';
      const dato2 = '2018-12-31';

      expect(datoDiffMenneskelig(dato1, dato2)).toBe('12 måneder');
    });

    test('forskjell er 6 måneder', () => {
      const dato1 = '2018-04-20';
      const dato2 = '2018-10-19';

      expect(datoDiffMenneskelig(dato1, dato2)).toBe('6 måneder');
    });

    test('forskjell er 1 måned og 5 dager', () => {
      const dato1 = '2016-02-16';
      const dato2 = '2016-03-20';

      expect(datoDiffMenneskelig(dato1, dato2)).toBe('1 måned og 5 dager');
    });

    test('forskjell er 12 måneder', () => {
      const dato1 = '2016-01-01';
      const dato2 = '2016-12-31';

      expect(datoDiffMenneskelig(dato1, dato2)).toBe('12 måneder');
    })
  });

  describe('beregnAlder', () => {
    test('alder er 39 31. desember', () => {
      MockDate.set('12/31/2017');
      const foedselsdato = '1978-01-01';
      const forventetAlder = 39;
      expect(beregnAlder(foedselsdato)).toBe(forventetAlder);
    });

    test('alder er 40 1. januar', () => {
      MockDate.set('1/1/2018');
      const foedselsdato = '1978-01-01';
      const forventetAlder = 40;
      expect(beregnAlder(foedselsdato)).toBe(forventetAlder);
    })
  })
});
