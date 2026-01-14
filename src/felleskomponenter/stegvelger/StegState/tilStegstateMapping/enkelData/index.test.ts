import { describe, it, expect } from "vitest";
import { slettEnkelData, lagEnkelData, konverterEnkelDataTilStegData } from "./index";

describe("enkelData mapping functions", () => {
  describe("slettEnkelData", () => {
    it("skal returnere objekt med felt og type", () => {
      const felt = "testFelt";
      const type = "testType";

      const result = slettEnkelData(felt, type);

      expect(result).toEqual({
        felt,
        type,
      });
    });

    it("skal håndtere ulike felt-verdier", () => {
      const result1 = slettEnkelData("lovvalgsbestemmelse", "LOVVALGSBESTEMMELSE");
      const result2 = slettEnkelData("lovvalgsland", "LOVVALGSLAND");

      expect(result1.felt).toBe("lovvalgsbestemmelse");
      expect(result1.type).toBe("LOVVALGSBESTEMMELSE");
      expect(result2.felt).toBe("lovvalgsland");
      expect(result2.type).toBe("LOVVALGSLAND");
    });
  });

  describe("lagEnkelData", () => {
    it("skal returnere objekt med alle påkrevde felt", () => {
      const data = { value: "test" };
      const type = "TEST_TYPE";

      const result = lagEnkelData(data, type);

      expect(result).toEqual({
        felt: type,
        oppdaterRedux: true,
        type,
        innhold: data,
      });
    });

    it("skal sette oppdaterRedux til true som standard", () => {
      const result = lagEnkelData({ value: "data" }, "TYPE");

      expect(result.oppdaterRedux).toBe(true);
    });

    it("skal håndtere ulike datatyper", () => {
      const stringData = "test string";
      const numberData = 42;
      const objectData = { key: "value", nested: { data: true } };
      const arrayData = [1, 2, 3];

      expect(lagEnkelData(stringData, "STRING").innhold).toBe(stringData);
      expect(lagEnkelData(numberData, "NUMBER").innhold).toBe(numberData);
      expect(lagEnkelData(objectData, "OBJECT").innhold).toEqual(objectData);
      expect(lagEnkelData(arrayData, "ARRAY").innhold).toEqual(arrayData);
    });

    it("skal håndtere null og undefined", () => {
      const nullResult = lagEnkelData(null, "NULL_TYPE");
      const undefinedResult = lagEnkelData(undefined, "UNDEFINED_TYPE");

      expect(nullResult.innhold).toBeNull();
      expect(undefinedResult.innhold).toBeUndefined();
    });
  });

  describe("konverterEnkelDataTilStegData", () => {
    it("skal returnere objekt uten oppdaterRedux-flagg", () => {
      const data = { value: "test" };
      const type = "TEST_TYPE";

      const result = konverterEnkelDataTilStegData(data, type);

      expect(result).toEqual({
        felt: type,
        type,
        innhold: data,
      });
      expect(result).not.toHaveProperty("oppdaterRedux");
    });

    it("skal ha samme struktur som lagEnkelData bortsett fra oppdaterRedux", () => {
      const data = { key: "value" };
      const type = "TYPE";

      const lagResult = lagEnkelData(data, type);
      const konverterResult = konverterEnkelDataTilStegData(data, type);

      expect(lagResult.felt).toBe(konverterResult.felt);
      expect(lagResult.type).toBe(konverterResult.type);
      expect(lagResult.innhold).toEqual(konverterResult.innhold);
      expect(lagResult).toHaveProperty("oppdaterRedux");
      expect(konverterResult).not.toHaveProperty("oppdaterRedux");
    });

    it("skal håndtere ulike datatyper", () => {
      const objectData = { key: "value" };
      const arrayData = [1, 2, 3];
      const stringData = "test";

      const objectResult = konverterEnkelDataTilStegData(objectData, "OBJECT");
      const arrayResult = konverterEnkelDataTilStegData(arrayData, "ARRAY");
      const stringResult = konverterEnkelDataTilStegData(stringData, "STRING");

      expect(objectResult.innhold).toEqual(objectData);
      expect(arrayResult.innhold).toEqual(arrayData);
      expect(stringResult.innhold).toBe(stringData);
    });
  });

  describe("Integration - bruk av alle tre funksjoner sammen", () => {
    it("skal kunne lage, konvertere og slette data", () => {
      const testData = { periode: { fom: "2025-01-01", tom: "2025-12-31" } };
      const type = "LOVVALGSPERIODE";

      // Lag data med oppdaterRedux-flagg
      const lagd = lagEnkelData(testData, type);
      expect(lagd.oppdaterRedux).toBe(true);
      expect(lagd.innhold).toEqual(testData);

      // Konverter til stegdata uten flagg
      const konvertert = konverterEnkelDataTilStegData(testData, type);
      expect(konvertert).not.toHaveProperty("oppdaterRedux");
      expect(konvertert.innhold).toEqual(testData);

      // Slett data
      const slettet = slettEnkelData(type, type);
      expect(slettet.felt).toBe(type);
      expect(slettet.type).toBe(type);
    });
  });
});
