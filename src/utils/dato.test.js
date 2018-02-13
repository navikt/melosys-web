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

it('godtar alle tillatte datoformater', () => {
  const tillatteDatoer = [
    {test: '010113', 'forvent': '01.01.2013'},
    {test: '300113', 'forvent': '30.01.2013'},
    {test: '060479', 'forvent': '06.04.1979'},
    {test: '260479', 'forvent': '26.04.1979'},
    {test: '26041979', 'forvent': '26.04.1979'},
    {test: '26-04-79', 'forvent': '26.04.1979'},
    {test: '01-01-79', 'forvent': '01.01.1979'},
    {test: '26-04-1979', 'forvent': '26.04.1979'},
    {test: '26-04-1979', 'forvent': '26.04.1979'},
    {test: '1979-07-02', 'forvent': false},
    {test: '29-02-17', 'forvent': false},
    {test: '121979', 'forvent': false},
    {test: 'abcdef', 'forvent': false},
   ];

  tillatteDatoer.map(datoTest => {
    const vasketDato = vaskInputDato(datoTest.test);
    expect(vasketDato).toEqual(datoTest.forvent);
  })
});

it('tolker årstall med 2 siffer riktig', () => {
  MockDate.set('1/1/2010');

  const tillatteDatoer = [
    {test: `26-04-20`, 'forvent': `26.04.2020`},
    {test: `26-04-30`, 'forvent': `26.04.1930`},
  ];

  tillatteDatoer.map(datoTest => {
    const vasketDato = vaskInputDato(datoTest.test);
    expect(vasketDato).toEqual(datoTest.forvent);
  });
});

it('normaliserer ikke dersom verdiene er forskjellige, dvs at brukeren fortsatt står i felt (focus)', () => {
  const verdi = '123456';
  const forrigeVerdi = '12345';

  expect(normaliserInputDato(verdi, forrigeVerdi)).toEqual(verdi);
});

it('normaliserer dersom begge verdiene er like (indikerer forlatt felt / blur field)', () => {
  const verdi = '011217';
  const forrigeVerdi = '011217';

  // Forvent en eller annen form for normalisering. Sjekker IKKE selve formatet, men kun at det
  // har skjedd en endring fra verdi.
  expect(normaliserInputDato(verdi, forrigeVerdi)).not.toEqual(false);
});

it('formatterer datoen riktig til norsk format DD.MM.YYYY HH:mm:ss og med evt klokkeslett', () => {
  const tillatteDatoer = [
    {test: '2016-01-12', 'forvent': '12.01.2016', klokkeslett: false},
    {test: '2017-12-01T20:58:01', 'forvent': '01.12.2017', klokkeslett: false},
    {test: '2017-12-01T20:58:01', 'forvent': '01.12.2017 20:58', klokkeslett: true},
    {test: '2017-12-01T01:08:01', 'forvent': '01.12.2017 01:08', klokkeslett: true},
    {test: '01.02.1979', 'forvent': '01.02.1979', klokkeslett: false},
    {test: '01.02.1979', 'forvent': '01.02.1979', klokkeslett: false},
    {test: '12.02.2000 20:00:1', 'forvent': '12.02.2000 20:00', klokkeslett: true},
  ];

  tillatteDatoer.forEach(datoTest => {
    const formattertDato = formatterDatoTilNorsk(datoTest.test, datoTest.klokkeslett);
    expect(formattertDato).toEqual(datoTest.forvent);
  });
})

it('formatterer norsk dato korrekt tilbake til maskinlesbar dato', () => {
  const tillatteDatoer = [
    {test: '01.01.2018 10:34', tid: true, forvent: '2018-01-01T10:34:00'},
    {test: '01.01.2018', tid: false, forvent: '2018-01-01'},
    {test: '10.12.2018 10:34', tid: true, forvent: '2018-12-10T10:34:00'},
    {test: '10.12.2018', tid: false, forvent: '2018-12-10'}
  ]

  tillatteDatoer.forEach(datoTest => {
    const formattertDato = formatterDatoTilISO(datoTest.test, datoTest.tid);
    expect(formattertDato).toEqual(datoTest.forvent);
  });
})

it('formatterer kort-datoene korrekt til lesbar dato', () => {
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
