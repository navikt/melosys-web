/* eslint-disable */
import * as Person from './person';

describe('Tester person.js:', () => {
  describe('fulltNavn', () => {
    test('feiler dersom mellomrom i navn mangler', () => {
      const mockData = 'OlaNordmann';
      expect(Person.fulltNavn(mockData)).toBe('Du må skrive inn både fornavn og etternavn.');
    })

    test('returnerer null (dvs ingen feilmelding) dersom navnet har ett eller flere mellomrom', () => {
      const mockData1 = 'Ola Nordmann';
      const mockData2 = 'Ola Jensenius Nordmann';
      const mockData3 = 'Ola Jensenius Hansen Nordmann';
      expect(Person.fulltNavn(mockData1)).toBe(null);
      expect(Person.fulltNavn(mockData2)).toBe(null);
      expect(Person.fulltNavn(mockData3)).toBe(null);
    })
  })

  describe('fnr', () => {
    test('feiler dersom verdi er mindre enn 11', () => {
      const mockData = '0123456783';
      expect(Person.fnr(mockData)).toBe('Fødselsnummer må bestå av 9 siffer.');
    })

    test('feiler dersom verdi er større enn 11', () => {
      const mockData = '0123456783';
      expect(Person.fnr(mockData)).toBe('Fødselsnummer må bestå av 9 siffer.');
    })

    test('', () => {
      const mockData1 = 'Ola Nordmann';
      const mockData2 = 'Ola Jensenius Nordmann';
      const mockData3 = 'Ola Jensenius Hansen Nordmann';
      expect(Person.fulltNavn(mockData1)).toBe(null);
      expect(Person.fulltNavn(mockData2)).toBe(null);
      expect(Person.fulltNavn(mockData3)).toBe(null);
    })
  })
});
