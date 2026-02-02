import {
  boolTilNorsk,
  norskTilBool,
  boolTilStreng,
  boolTilUppercaseStreng,
  strengTilBool,
  uppercaseStrengTilBool,
  strengTilInt,
  tekstEllerDash,
  storeForbokstaver,
  storeForbokstaverForLand,
  arrayTilKonjunksjon,
  separerListeMedBindestrek,
  tryParseFloat,
  tryParseBool,
  harStrengInnhold,
} from "./streng";
import { BOOLSK_STRING } from "../constants";

describe("streng.js", () => {
  describe("boolTilNorsk", () => {
    test('Oversetter true til "JA"', () => {
      expect(boolTilNorsk(true)).toEqual("JA");
    });
    test('Oversetter false til "NEI"', () => {
      expect(boolTilNorsk(false)).toEqual("NEI");
    });
  });
  describe("norskTilBool", () => {
    test("Oversetter JA til true", () => {
      expect(norskTilBool("JA")).toEqual(true);
    });
    test("Oversetter NEI til false", () => {
      expect(norskTilBool("NEI")).toEqual(false);
    });
  });
  describe("boolTilStreng", () => {
    test('Oversetter true => "true"', () => {
      expect(boolTilStreng(true)).toEqual("true");
    });
    test('Oversetter false => "false"', () => {
      expect(boolTilStreng(false)).toEqual("false");
    });
    test("Oversetter ikke undefined", () => {
      expect(boolTilStreng(undefined)).toEqual(undefined);
    });
    test("Oversetter ikke null", () => {
      expect(boolTilStreng(null)).toEqual(undefined);
    });
  });
  describe("boolTilUppercaseStreng", () => {
    test("Oversetter true => 'TRUE'", () => {
      expect(boolTilUppercaseStreng(true)).toEqual("TRUE");
    });
    test("Oversetter false => 'FALSE", () => {
      expect(boolTilUppercaseStreng(false)).toEqual("FALSE");
    });
    test("Oversetter true => BOOLSK_STRING.SANN", () => {
      expect(boolTilUppercaseStreng(true)).toEqual(BOOLSK_STRING.SANN);
    });
    test("Oversetter false => BOOLSK_STRING.USANN", () => {
      expect(boolTilUppercaseStreng(false)).toEqual(BOOLSK_STRING.USANN);
    });
    test("Oversetter ikke undefined", () => {
      expect(boolTilUppercaseStreng(undefined)).toEqual(undefined);
    });
    test("Oversetter ikke null", () => {
      expect(boolTilUppercaseStreng(null)).toEqual(undefined);
    });
  });
  describe("strengTilBool", () => {
    test('Transformerer "true" => true', () => {
      expect(strengTilBool("true")).toEqual(true);
    });
    test('Transformerer "false" => false', () => {
      expect(strengTilBool("false")).toEqual(false);
    });
    test('Transformerer "undefined" => false', () => {
      expect(strengTilBool("undefined")).toEqual(false);
    });
  });

  describe("uppercaseStrengTilBool", () => {
    test("Transformerer 'TRUE' => true", () => {
      expect(uppercaseStrengTilBool("TRUE")).toEqual(true);
    });
    test("Transformerer 'FALSE' => false", () => {
      expect(uppercaseStrengTilBool("FALSE")).toEqual(false);
    });
    test("Transformerer BOOLSK_STRING.SANN => true", () => {
      expect(uppercaseStrengTilBool(BOOLSK_STRING.SANN)).toEqual(true);
    });
    test("Transformerer BOOLSK_STRING.USANN => false", () => {
      expect(uppercaseStrengTilBool(BOOLSK_STRING.USANN)).toEqual(false);
    });
    test("Transformerer undefined => undefined", () => {
      expect(uppercaseStrengTilBool(undefined)).toEqual(undefined);
    });
    test("Transformerer null => undefined", () => {
      expect(uppercaseStrengTilBool(null)).toEqual(undefined);
    });
  });
  describe("strengTilInt", () => {
    test('Transformerer "1" => 1', () => {
      expect(strengTilInt("1")).toEqual(1);
    });
    test('Transformerer "-1" => -1', () => {
      expect(strengTilInt("-1")).toEqual(-1);
    });
  });
  describe("tekstEllerDash", () => {
    test('Oversetter tom verdi med "-"', () => {
      expect(tekstEllerDash(undefined)).toEqual("-");
    });
    test("Returnerer gyldig verdi uendret", () => {
      const testString = "test string";
      expect(tekstEllerDash(testString)).toEqual(testString);
    });
  });

  describe("storeForbokstaver", () => {
    test("Oppdaterer forste bokstav i hvert ord i setningen med stor bokstav", () => {
      const testString = "en to tre fire fem";
      expect(storeForbokstaver(testString)).toEqual("En To Tre Fire Fem");
    });
  });

  describe("storeForbokstaverForLand for landnavn", () => {
    test("Gjør første bokstav i hvert ord om til stor bokstav", () => {
      const testString = "LANGTVEKKISTAN";
      expect(storeForbokstaverForLand(testString)).toEqual("Langtvekkistan");
    });

    test("Gjør første bokstav etter bindestrek om til stor bokstav", () => {
      const testString = "BORTE-VEKK";
      expect(storeForbokstaverForLand(testString)).toEqual("Borte-Vekk");
    });

    test('"og" blir ikke gjort om til stor bokstav', () => {
      const testString = "BORTE-VEKK OG LANGTVEKKISTAN";
      expect(storeForbokstaverForLand(testString)).toEqual("Borte-Vekk og Langtvekkistan");
    });

    test('"of" blir ikke gjort om til stor bokstav', () => {
      const testString = "BORTE-VEKK OF LANGTVEKKISTAN";
      expect(storeForbokstaverForLand(testString)).toEqual("Borte-Vekk of Langtvekkistan");
    });

    test('"i" blir ikke gjort om til stor bokstav', () => {
      const testString = "BORTE-VEKK I LANGTVEKKISTAN";
      expect(storeForbokstaverForLand(testString)).toEqual("Borte-Vekk i Langtvekkistan");
    });
  });

  describe("arrayTilKonjunksjon", () => {
    test("konjunksjon gir kun ett ord ved ett element i liste", () => {
      const liste = ["Foo"];
      const forventetResultat = "Foo";

      expect(arrayTilKonjunksjon(liste)).toEqual(forventetResultat);
    });

    test("konjunksjon gir komma ved liste på 2 elementer", () => {
      const liste = ["Foo", "Bar"];
      const forventetResultat = "Foo og Bar";

      expect(arrayTilKonjunksjon(liste)).toEqual(forventetResultat);
    });

    test('konjunksjon gir komma og "og" ved liste på 5 elementer', () => {
      const liste = ["Foo", "Boo", "Bar", "Baz", "Maz"];
      const forventetResultat = "Foo, Boo, Bar, Baz og Maz";

      expect(arrayTilKonjunksjon(liste)).toEqual(forventetResultat);
    });

    test("håndterer argumenter som er tom array", () => {
      const liste: string[] = [];
      const forventetResultat = "";

      expect(arrayTilKonjunksjon(liste)).toEqual(forventetResultat);
    });

    test("håndterer argumenter som er string", () => {
      const liste = "Foo, Bar";
      const forventetResultat = "Foo, Bar";

      expect(arrayTilKonjunksjon(liste as any)).toEqual(forventetResultat);
    });
  });
  describe("tryParseFloat", () => {
    test("returnerer null for falsy verdier", () => {
      expect(tryParseFloat(null)).toBeNull();
      expect(tryParseFloat(undefined)).toBeNull();
      expect(tryParseFloat(0)).toBeNull();
    });

    test("returnerer number direkte", () => {
      expect(tryParseFloat(42.5)).toBe(42.5);
    });

    test("parser string til float", () => {
      expect(tryParseFloat("3.14")).toBe(3.14);
    });

    test("returnerer null for ugyldig string", () => {
      expect(tryParseFloat("abc")).toBeNull();
    });
  });

  describe("separerListeMedBindestrek", () => {
    test("separerer liste med bindestrek", () => {
      expect(separerListeMedBindestrek(["Foo", "Bar", "Baz"])).toBe("Foo - Bar - Baz");
    });

    test("ett element gir kun elementet", () => {
      expect(separerListeMedBindestrek(["Foo"])).toBe("Foo");
    });

    test("tom array gir tom streng", () => {
      expect(separerListeMedBindestrek([])).toBe("");
    });

    test("håndterer falsy input", () => {
      expect(separerListeMedBindestrek(null as any)).toBe("");
    });

    test("håndterer string input", () => {
      expect(separerListeMedBindestrek("Foo, Bar" as any)).toBe("Foo, Bar");
    });
  });

  describe("arrayTilKonjunksjon med falsy input", () => {
    test("håndterer null/undefined", () => {
      expect(arrayTilKonjunksjon(null as any)).toBe("");
      expect(arrayTilKonjunksjon(undefined as any)).toBe("");
    });
  });

  describe("harStrengInnhold", () => {
    test("streng med innhold gir true", () => {
      expect(harStrengInnhold("En streng")).toBeTruthy();
    });
    test("tom streng gir false", () => {
      expect(harStrengInnhold("")).toBeFalsy();
    });
    test("null gir false", () => {
      expect(harStrengInnhold(null)).toBeFalsy();
    });
    test("<p></p> gir false", () => {
      expect(harStrengInnhold("<p></p>")).toBeFalsy();
    });
    test("<p><br></p> gir false", () => {
      expect(harStrengInnhold("<p><br></p>")).toBeFalsy();
    });
  });

  describe("tryParseBool", () => {
    test("returnerer true for boolean true", () => {
      expect(tryParseBool(true)).toBe(true);
    });
    test("returnerer false for boolean false", () => {
      expect(tryParseBool(false)).toBe(false);
    });
    test('returnerer true for "true"', () => {
      expect(tryParseBool("true")).toBe(true);
    });
    test('returnerer true for "TRUE"', () => {
      expect(tryParseBool("TRUE")).toBe(true);
    });
    test('returnerer false for "false"', () => {
      expect(tryParseBool("false")).toBe(false);
    });
    test('returnerer false for "FALSE"', () => {
      expect(tryParseBool("FALSE")).toBe(false);
    });
    test("returnerer undefined for ugyldig streng", () => {
      expect(tryParseBool("kanskje")).toBeUndefined();
    });
  });

  describe("storeForbokstaverForLand - spesialtilfeller", () => {
    test("USA forblir uppercase", () => {
      expect(storeForbokstaverForLand("USA")).toBe("USA");
    });
  });

  describe("storeForbokstaver - edge cases", () => {
    test("håndterer null", () => {
      expect(storeForbokstaver(null)).toBeUndefined();
    });
    test("håndterer undefined", () => {
      expect(storeForbokstaver(undefined)).toBeUndefined();
    });
  });
});
