import { describe, test, expect } from "vitest";
import * as Person from "./person";
import * as testhelpers from "./testhelpers";

describe("Tester person.js:", () => {
  describe("erGyldigFnr", () => {
    test("returnerer false ved feil fødselsnummer", () => {
      const mockData1 = "22222222222";
      const mockData2 = "31025043514";
      const mockData3 = "01010533445";
      const forventetFeil = false;
      expect(Person.erGyldigFnr(mockData1)).toEqual(forventetFeil);
      expect(Person.erGyldigFnr(mockData2)).toEqual(forventetFeil);
      expect(Person.erGyldigFnr(mockData3)).toEqual(forventetFeil);
    });

    test("returnerer true ved riktig fødselsnummer", () => {
      const generator = new testhelpers.Generator();
      const mockData1 = generator.generateBirthNumber();
      const mockData2 = generator.generateBirthNumber();
      const mockData3 = generator.generateBirthNumber();
      const mockData4 = generator.generateBirthNumber();

      const forventetFeil = true;
      expect(Person.erGyldigFnr(mockData1)).toEqual(forventetFeil);
      expect(Person.erGyldigFnr(mockData2)).toEqual(forventetFeil);
      expect(Person.erGyldigFnr(mockData3)).toEqual(forventetFeil);
      expect(Person.erGyldigFnr(mockData4)).toEqual(forventetFeil);
    });
  });

  describe("erFnrLengde", () => {
    test("returnerer false når fnr ikke er 11 siffer.", () => {
      const mockData1 = "1111111111";
      const mockData2 = "111111111111";
      const forventet = false;

      expect(Person.erFnrLengde(mockData1)).toBe(forventet);
      expect(Person.erFnrLengde(mockData2)).toBe(forventet);
    });

    test("returnerer true når fnr er 11 siffer.", () => {
      const mockData = "11111111111";
      const forventet = true;
      expect(Person.erFnrLengde(mockData)).toEqual(forventet);
    });
  });

  describe("erDnrLengde", () => {
    test("returnerer false når fnr ikke er 11 siffer.", () => {
      const mockData1 = "1111111111";
      const mockData2 = "111111111111";
      const forventet = false;

      expect(Person.erDnrLengde(mockData1)).toBe(forventet);
      expect(Person.erDnrLengde(mockData2)).toBe(forventet);
    });

    test("returnerer true når fnr er 11 siffer.", () => {
      const mockData = "11111111111";
      const forventet = true;
      expect(Person.erDnrLengde(mockData)).toEqual(forventet);
    });
  });

  describe("erGyldigDnr", () => {
    test("returnerer false ved feil dnr", () => {
      const mockData1 = "22222222222";
      const mockData2 = "31025043514";
      const mockData3 = "01010533445";
      const forventet = false;
      expect(Person.erGyldigDnr(mockData1)).toEqual(forventet);
      expect(Person.erGyldigDnr(mockData2)).toEqual(forventet);
      expect(Person.erGyldigDnr(mockData3)).toEqual(forventet);
    });

    test("returnerer true ved riktig dnr", () => {
      const generator = new testhelpers.Generator();
      const mockData1 = generator.generateDNumber();
      const mockData2 = generator.generateDNumber();
      const mockData3 = generator.generateDNumber();
      const mockData4 = generator.generateDNumber();

      const forventet = true;
      expect(Person.erGyldigDnr(mockData1)).toEqual(forventet);
      expect(Person.erGyldigDnr(mockData2)).toEqual(forventet);
      expect(Person.erGyldigDnr(mockData3)).toEqual(forventet);
      expect(Person.erGyldigDnr(mockData4)).toEqual(forventet);
    });
  });

  describe("tilSammensattNavnFraObjekt", () => {
    test("returnerer sammensatt navn fra objekt", () => {
      expect(Person.tilSammensattNavnFraObjekt({ fornavn: "Per", mellomnavn: "Pål", etternavn: "Askeladden" })).toBe(
        "Per Pål Askeladden",
      );
    });

    test("returnerer tom streng for null/undefined", () => {
      expect(Person.tilSammensattNavnFraObjekt(null)).toBe("");
      expect(Person.tilSammensattNavnFraObjekt(undefined)).toBe("");
    });
  });

  describe("tilSammensattNavn", () => {
    test("riktig med mellomnavn", () => {
      const fornavn = "Per";
      const mellomnavn = "Pål";
      const etternavn = "Askeladden";
      const forventet = "Per Pål Askeladden";
      expect(Person.tilSammensattNavn(fornavn, mellomnavn, etternavn)).toEqual(forventet);
    });

    test("riktig uten mellomnavn", () => {
      const fornavn = "Espen";
      const mellomnavn = null;
      const etternavn = "Askeladden";
      const forventet = "Espen Askeladden";
      expect(Person.tilSammensattNavn(fornavn, mellomnavn, etternavn)).toEqual(forventet);
    });
  });
});
