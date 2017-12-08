/* eslint-disable */

import {vaskInputDato, normaliserInputDato} from './dato';

import MockDate from 'mockdate';


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
