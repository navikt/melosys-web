/* eslint-disable */

import {vaskInputDato, MAX_AR_FREM_I_TID} from './dato';

it('godtar alle tillatte datoformater', () => {
  const tillatteDatoer = [
    {test: '260479', 'forvent': '26.04.1979'},
    {test: '26041979', 'forvent': '26.04.1979'},
    {test: '26-04-79', 'forvent': '26.04.1979'},
    {test: '26-04-1979', 'forvent': '26.04.1979'},
    {test: '26-04-1979', 'forvent': '26.04.1979'},
   ];

  tillatteDatoer.map(datoTest => {
    const vasketDato = vaskInputDato(datoTest.test);
    expect(vasketDato).toEqual(datoTest.forvent);
  })

});

it('tolker årstall med 2 siffer riktig', () => {

  const tillatteDatoer = [
    {test: '26-04-50', 'forvent': '26.04.1950'},
    {test: '26-04-20', 'forvent': '26.04.2020'},
  ];

  tillatteDatoer.map(datoTest => {
    const vasketDato = vaskInputDato(datoTest.test);
    expect(vasketDato).toEqual(datoTest.forvent);
  })

});
