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

  describe('erGyldigFnr', () => {
    test('returnerer false ved feil fødselsnummer', () => {
      const mockData1 = '22222222222';
      const mockData2 = '31025043514';
      const mockData3 = '01010533445';
      const forventetFeil = false;
      expect(Person.erGyldigFnr(mockData1)).toEqual(forventetFeil);
      expect(Person.erGyldigFnr(mockData2)).toEqual(forventetFeil);
      expect(Person.erGyldigFnr(mockData3)).toEqual(forventetFeil);
    });

    test('returnerer true ved riktig fødselsnummer', () => {
      const mockData1 = '19117220349'; //Glitrende Hatt
      const mockData2 = '21027500134'; //Blå Konsoll
      const mockData3 = '22127501762'; //Rask Kaffi
      const mockData4 = '02025618273'; //Artig Saks
      const mockData5 = '31057406782'; //Naturlig Maskin

      const forventetFeil = true;
      expect(Person.erGyldigFnr(mockData1)).toEqual(forventetFeil);
      expect(Person.erGyldigFnr(mockData2)).toEqual(forventetFeil);
      expect(Person.erGyldigFnr(mockData3)).toEqual(forventetFeil);
      expect(Person.erGyldigFnr(mockData4)).toEqual(forventetFeil);
      expect(Person.erGyldigFnr(mockData5)).toEqual(forventetFeil);
    });
  })

  describe('erFnrLengde', () => {
    test('returnerer false når fnr ikke er 11 siffer.', () => {
      const mockData1 = '1111111111';
      const mockData2 = '111111111111';
      const forventet = false;

      expect(Person.erFnrLengde(mockData1)).toBe(forventet);
      expect(Person.erFnrLengde(mockData2)).toBe(forventet);
    })

    test('returnerer true når fnr er 11 siffer.', () => {
      const mockData = '11111111111';
      const forventet = true;
      expect(Person.erFnrLengde(mockData)).toEqual(forventet)
    })
  })

  describe('erDnrLengde', () => {
    test('returnerer false når fnr ikke er 11 siffer.', () => {
      const mockData1 = '1111111111';
      const mockData2 = '111111111111';
      const forventet = false;

      expect(Person.erDnrLengde(mockData1)).toBe(forventet);
      expect(Person.erDnrLengde(mockData2)).toBe(forventet);
    })

    test('returnerer true når fnr er 11 siffer.', () => {
      const mockData = '11111111111';
      const forventet = true;
      expect(Person.erDnrLengde(mockData)).toEqual(forventet)
    })
  })

  describe('erGyldigDnr', () => {
    test('returnerer false ved feil dnr', () => {
      const mockData1 = '22222222222';
      const mockData2 = '31025043514';
      const mockData3 = '01010533445';
      const forventetFeil = false;
      expect(Person.erGyldigDnr(mockData1)).toEqual(forventetFeil);
      expect(Person.erGyldigDnr(mockData2)).toEqual(forventetFeil);
      expect(Person.erGyldigDnr(mockData3)).toEqual(forventetFeil);
    });

    test('returnerer true ved riktig dnr', () => {
      const mockData1 = '59117220332'; //Glitrende Hatt + 4
      const mockData2 = '61027500128'; //Blå Konsoll + 4
      const mockData3 = '62127501756'; //Rask Kaffi + 4
      const mockData4 = '42025618267'; //Artig Saks + 4
      const mockData5 = '71057406776'; //Naturlig Maskin + 4

      const forventetFeil = true;
      expect(Person.erGyldigDnr(mockData1)).toEqual(forventetFeil);
      expect(Person.erGyldigDnr(mockData2)).toEqual(forventetFeil);
      expect(Person.erGyldigDnr(mockData3)).toEqual(forventetFeil);
      expect(Person.erGyldigDnr(mockData4)).toEqual(forventetFeil);
      expect(Person.erGyldigDnr(mockData5)).toEqual(forventetFeil);
    });
  })
});
