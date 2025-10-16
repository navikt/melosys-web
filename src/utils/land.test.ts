import { describe, it, expect, vi } from "vitest";
import { landTekstFormat, sorterLandOgGjørOmTilStoreForbokstaver } from "./land";

// Mock streng utils
vi.mock("./streng", () => ({
  storeForbokstaverForLand: (str) => {
    // Simulate Title Case transformation
    return str
      .replace(/(\w)[^\s-]*/g, (word) => word.charAt(0).toUpperCase() + word.substring(1).toLowerCase())
      .replace("Usa", "USA")
      .replace(" Og ", " og ")
      .replace(" Of ", " of ")
      .replace(" I ", " i ");
  },
}));

describe("land utils", () => {
  describe("landTekstFormat", () => {
    it("skal formatere land med term og kode", () => {
      const landObjekt = { term: "Norge", kode: "NO" };
      const result = landTekstFormat(landObjekt);
      expect(result).toBe("Norge (NO)");
    });

    it("skal formatere land med lang term", () => {
      const landObjekt = { term: "Storbritannia og Nord-Irland", kode: "GB" };
      const result = landTekstFormat(landObjekt);
      expect(result).toBe("Storbritannia og Nord-Irland (GB)");
    });

    it("skal håndtere land med spesialtegn i term", () => {
      const landObjekt = { term: "Côte d'Ivoire", kode: "CI" };
      const result = landTekstFormat(landObjekt);
      expect(result).toBe("Côte d'Ivoire (CI)");
    });

    it("skal håndtere tom term", () => {
      const landObjekt = { term: "", kode: "XX" };
      const result = landTekstFormat(landObjekt);
      expect(result).toBe(" (XX)");
    });

    it("skal håndtere tom kode", () => {
      const landObjekt = { term: "Land", kode: "" };
      const result = landTekstFormat(landObjekt);
      expect(result).toBe("Land ()");
    });
  });

  describe("sorterLandOgGjørOmTilStoreForbokstaver", () => {
    it("skal sortere land alfabetisk", () => {
      const landObjekter = [
        { term: "Tyskland", kode: "DE" },
        { term: "Norge", kode: "NO" },
        { term: "Sverige", kode: "SE" },
      ];

      const result = sorterLandOgGjørOmTilStoreForbokstaver(landObjekter);

      expect(result[0].kode).toBe("NO");
      expect(result[1].kode).toBe("SE");
      expect(result[2].kode).toBe("DE");
    });

    it("skal konvertere term til Title Case", () => {
      const landObjekter = [
        { term: "norge", kode: "NO" },
        { term: "sverige", kode: "SE" },
      ];

      const result = sorterLandOgGjørOmTilStoreForbokstaver(landObjekter);

      expect(result[0].term).toBe("Norge");
      expect(result[1].term).toBe("Sverige");
    });

    it("skal beholde original kode", () => {
      const landObjekter = [
        { term: "Norge", kode: "NO" },
        { term: "Sverige", kode: "SE" },
      ];

      const result = sorterLandOgGjørOmTilStoreForbokstaver(landObjekter);

      expect(result[0].kode).toBe("NO");
      expect(result[1].kode).toBe("SE");
    });

    it("skal håndtere tom array", () => {
      const result = sorterLandOgGjørOmTilStoreForbokstaver([]);
      expect(result).toEqual([]);
    });

    it("skal håndtere array med ett element", () => {
      const landObjekter = [{ term: "Norge", kode: "NO" }];
      const result = sorterLandOgGjørOmTilStoreForbokstaver(landObjekter);

      expect(result).toHaveLength(1);
      expect(result[0].term).toBe("Norge");
      expect(result[0].kode).toBe("NO");
    });

    it("skal sortere land med like termer", () => {
      const landObjekter = [
        { term: "Norge", kode: "NO" },
        { term: "Norge", kode: "NO2" },
      ];

      const result = sorterLandOgGjørOmTilStoreForbokstaver(landObjekter);

      expect(result).toHaveLength(2);
      expect(result[0].kode).toBe("NO");
      expect(result[1].kode).toBe("NO2");
    });

    it("skal sortere alfabetisk uavhengig av case", () => {
      const landObjekter = [
        { term: "tyskland", kode: "DE" },
        { term: "Norge", kode: "NO" },
        { term: "SVERIGE", kode: "SE" },
      ];

      const result = sorterLandOgGjørOmTilStoreForbokstaver(landObjekter);

      // Sorteres etter original term (før store bokstaver)
      expect(result[0].kode).toBe("NO");
      expect(result[1].kode).toBe("SE");
      expect(result[2].kode).toBe("DE");
    });

    it("skal beholde ekstra felter i objektet", () => {
      const landObjekter = [
        { term: "Norge", kode: "NO", ekstraFelt: "test" },
        { term: "Sverige", kode: "SE", annetFelt: 123 },
      ];

      const result = sorterLandOgGjørOmTilStoreForbokstaver(landObjekter);

      expect(result[0].ekstraFelt).toBe("test");
      expect(result[1].annetFelt).toBe(123);
    });

    it("skal ikke mutere original array", () => {
      const landObjekter = [
        { term: "Norge", kode: "NO" },
        { term: "Sverige", kode: "SE" },
      ];

      const original = [...landObjekter];
      sorterLandOgGjørOmTilStoreForbokstaver(landObjekter);

      expect(landObjekter).toEqual(original);
    });

    it("skal sortere mange land korrekt", () => {
      const landObjekter = [
        { term: "Østerrike", kode: "AT" },
        { term: "Belgia", kode: "BE" },
        { term: "Danmark", kode: "DK" },
        { term: "Finland", kode: "FI" },
        { term: "Frankrike", kode: "FR" },
      ];

      const result = sorterLandOgGjørOmTilStoreForbokstaver(landObjekter);

      expect(result[0].kode).toBe("BE");
      expect(result[1].kode).toBe("DK");
      expect(result[2].kode).toBe("FI");
      expect(result[3].kode).toBe("FR");
      expect(result[4].kode).toBe("AT");
    });
  });
});
