import { describe, it, expect } from "vitest";
import {
  fn,
  isJSON,
  queryParamsTilObjekt,
  erPropertyUnik,
  finnVerdierMedKey,
  formaterTilNorskBelop,
  formaterTilNorskBelopUtenDesimaler,
} from "./utils";

describe("utils", () => {
  describe("fn", () => {
    it("skal returnere funksjon som returnerer verdien når input er ikke en funksjon", () => {
      const result = fn("test");

      expect(typeof result).toBe("function");
      expect(result()).toBe("test");
    });

    it("skal returnere funksjonen selv når input er en funksjon", () => {
      const testFn = () => "test";
      const result = fn(testFn);

      expect(result).toBe(testFn);
      expect(result()).toBe("test");
    });

    it("skal håndtere number", () => {
      const result = fn(42);

      expect(result()).toBe(42);
    });

    it("skal håndtere boolean", () => {
      const result = fn(true);

      expect(result()).toBe(true);
    });

    it("skal håndtere null", () => {
      const result = fn(null);

      expect(result()).toBe(null);
    });

    it("skal håndtere undefined", () => {
      const result = fn(undefined);

      expect(result()).toBe(undefined);
    });

    it("skal håndtere objekt", () => {
      const obj = { foo: "bar" };
      const result = fn(obj);

      expect(result()).toEqual(obj);
    });

    it("skal håndtere array", () => {
      const arr = [1, 2, 3];
      const result = fn(arr);

      expect(result()).toEqual(arr);
    });

    it("skal returnere funksjon med parametere", () => {
      const testFn = (a: number, b: number) => a + b;
      const result = fn(testFn);

      expect(result(5, 3)).toBe(8);
    });
  });

  describe("isJSON", () => {
    it("skal returnere true for valid JSON object string", () => {
      const jsonString = '{"foo":"bar"}';

      expect(isJSON(jsonString)).toBe(true);
    });

    it("skal returnere true for valid JSON array string", () => {
      const jsonString = "[1,2,3]";

      expect(isJSON(jsonString)).toBe(true);
    });

    it("skal returnere false for invalid JSON", () => {
      const invalidJson = "{foo:bar}";

      expect(isJSON(invalidJson)).toBe(false);
    });

    it("skal returnere false for tom string", () => {
      expect(isJSON("")).toBe(false);
    });

    it("skal returnere false for vanlig tekst", () => {
      expect(isJSON("hello world")).toBe(false);
    });

    it("skal returnere true for JSON med nested objects", () => {
      const jsonString = '{"foo":{"bar":"baz"}}';

      expect(isJSON(jsonString)).toBe(true);
    });

    it("skal returnere true for JSON med array av objekter", () => {
      const jsonString = '[{"id":1},{"id":2}]';

      expect(isJSON(jsonString)).toBe(true);
    });

    it("skal returnere false for undefined", () => {
      expect(isJSON(undefined)).toBe(false);
    });

    it("skal returnere null for null input", () => {
      expect(isJSON(null)).toBe(null);
    });

    it("skal returnere true for valid JSON med tall", () => {
      expect(isJSON("123")).toBe(true);
    });

    it("skal returnere false for valid JSON boolean (quirk i implementasjon)", () => {
      // JSON.parse("false") returnerer false, og false && !!str blir false
      expect(isJSON("true")).toBe(true);
      expect(isJSON("false")).toBe(false);
    });
  });

  describe("queryParamsTilObjekt", () => {
    it("skal parse enkel query string", () => {
      const result = queryParamsTilObjekt("?foo=bar");

      expect(result).toEqual({ foo: "bar" });
    });

    it("skal parse query string uten spørsmålstegn", () => {
      const result = queryParamsTilObjekt("foo=bar");

      expect(result).toEqual({ foo: "bar" });
    });

    it("skal parse flere parametere", () => {
      const result = queryParamsTilObjekt("?foo=bar&baz=qux");

      expect(result).toEqual({ foo: "bar", baz: "qux" });
    });

    it("skal parse query string med tall", () => {
      const result = queryParamsTilObjekt("?id=123&page=1");

      expect(result).toEqual({ id: "123", page: "1" });
    });

    it("skal håndtere tom verdi", () => {
      const result = queryParamsTilObjekt("?foo=");

      expect(result).toEqual({ foo: "" });
    });

    it("skal håndtere parameter uten verdi", () => {
      const result = queryParamsTilObjekt("?foo");

      expect(result).toEqual({ foo: undefined });
    });

    it("skal returnere tomt objekt for tom string", () => {
      const result = queryParamsTilObjekt("");

      expect(result).toEqual({});
    });

    it("skal håndtere mange parametere", () => {
      const result = queryParamsTilObjekt("?a=1&b=2&c=3&d=4");

      expect(result).toEqual({ a: "1", b: "2", c: "3", d: "4" });
    });
  });

  describe("erPropertyUnik", () => {
    it("skal returnere true når alle verdier er unike", () => {
      const array = [1, 2, 3, 4];

      expect(erPropertyUnik(array)).toBe(true);
    });

    it("skal returnere false når verdier er duplikater", () => {
      const array = [1, 2, 2, 3];

      expect(erPropertyUnik(array)).toBe(false);
    });

    it("skal returnere true for tom array", () => {
      expect(erPropertyUnik([])).toBe(true);
    });

    it("skal returnere true for array med ett element", () => {
      expect(erPropertyUnik([1])).toBe(true);
    });

    it("skal bruke mapper funksjon for å sjekke unike properties", () => {
      const array = [{ id: 1 }, { id: 2 }, { id: 3 }];

      expect(erPropertyUnik(array, (x: { id: number }) => x.id)).toBe(true);
    });

    it("skal returnere false når mapper gir duplikater", () => {
      const array = [{ id: 1 }, { id: 2 }, { id: 1 }];

      expect(erPropertyUnik(array, (x: { id: number }) => x.id)).toBe(false);
    });

    it("skal håndtere strenger", () => {
      const array = ["a", "b", "c"];

      expect(erPropertyUnik(array)).toBe(true);
    });

    it("skal returnere false for duplikat strenger", () => {
      const array = ["a", "b", "a"];

      expect(erPropertyUnik(array)).toBe(false);
    });

    it("skal håndtere komplekse mapper funksjoner", () => {
      const array = [
        { name: "John", age: 30 },
        { name: "Jane", age: 25 },
        { name: "John", age: 35 },
      ];

      expect(erPropertyUnik(array, (x: { name: string; age: number }) => x.name)).toBe(false);
      expect(erPropertyUnik(array, (x: { name: string; age: number }) => x.age)).toBe(true);
    });
  });

  describe("finnVerdierMedKey", () => {
    it("skal finne verdi med key i flatt objekt", () => {
      const obj = { foo: "bar", baz: "qux" };

      expect(finnVerdierMedKey(obj, "foo")).toEqual(["bar"]);
    });

    it("skal finne verdi i nested objekt", () => {
      const obj = { outer: { inner: { foo: "bar" } } };

      expect(finnVerdierMedKey(obj, "foo")).toEqual(["bar"]);
    });

    it("skal finne flere verdier med samme key", () => {
      const obj = {
        item1: { id: 1 },
        item2: { id: 2 },
      };

      expect(finnVerdierMedKey(obj, "id")).toEqual([1, 2]);
    });

    it("skal finne verdier i array", () => {
      const obj = [{ foo: "bar" }, { foo: "baz" }];

      expect(finnVerdierMedKey(obj, "foo")).toEqual(["bar", "baz"]);
    });

    it("skal returnere tom array når key ikke finnes", () => {
      const obj = { foo: "bar" };

      expect(finnVerdierMedKey(obj, "missing")).toEqual([]);
    });

    it("skal håndtere null", () => {
      expect(finnVerdierMedKey(null, "foo")).toEqual([]);
    });

    it("skal håndtere undefined", () => {
      expect(finnVerdierMedKey(undefined, "foo")).toEqual([]);
    });

    it("skal finne parent objekter når finnParent er true", () => {
      const obj = { item: { id: 1, name: "Test" } };

      const result = finnVerdierMedKey(obj, "id", true);

      expect(result).toEqual([{ id: 1, name: "Test" }]);
    });

    it("skal håndtere dypt nestet struktur", () => {
      const obj = {
        level1: {
          level2: {
            level3: {
              target: "found",
            },
          },
        },
      };

      expect(finnVerdierMedKey(obj, "target")).toEqual(["found"]);
    });

    it("skal finne flere forekomster i kompleks struktur", () => {
      const obj = {
        users: [
          { id: 1, profile: { email: "test1@example.com" } },
          { id: 2, profile: { email: "test2@example.com" } },
        ],
      };

      expect(finnVerdierMedKey(obj, "email")).toEqual(["test1@example.com", "test2@example.com"]);
    });

    it("skal returnere parent objekter for flere forekomster", () => {
      const obj = {
        item1: { id: 1 },
        item2: { id: 2 },
      };

      const result = finnVerdierMedKey(obj, "id", true);

      expect(result).toEqual([{ id: 1 }, { id: 2 }]);
    });
  });

  describe("formaterTilNorskBelop", () => {
    it("skal formatere tall til norsk beløp med 2 desimaler", () => {
      expect(formaterTilNorskBelop(1234.56)).toBe("1\u00A0234,56");
    });

    it("skal formatere tall uten desimaler til norsk beløp med 2 desimaler", () => {
      expect(formaterTilNorskBelop(1234)).toBe("1\u00A0234,00");
    });

    it("skal returnere undefined for undefined input", () => {
      expect(formaterTilNorskBelop(undefined)).toBe(undefined);
    });

    it("skal formatere store tall", () => {
      expect(formaterTilNorskBelop(1234567.89)).toBe("1\u00A0234\u00A0567,89");
    });

    it("skal formatere negative tall", () => {
      expect(formaterTilNorskBelop(-1234.56)).toBe("\u22121\u00A0234,56");
    });

    it("skal formatere null til 0,00", () => {
      expect(formaterTilNorskBelop(0)).toBe("0,00");
    });

    it("skal bruke custom antall desimaler", () => {
      expect(formaterTilNorskBelop(1234.5678, 3)).toBe("1\u00A0234,568");
    });

    it("skal bruke 0 desimaler når spesifisert", () => {
      expect(formaterTilNorskBelop(1234.56, 0)).toBe("1\u00A0235");
    });

    it("skal håndtere små tall", () => {
      expect(formaterTilNorskBelop(0.99)).toBe("0,99");
    });

    it("skal håndtere veldig store tall", () => {
      expect(formaterTilNorskBelop(1000000000)).toBe("1\u00A0000\u00A0000\u00A0000,00");
    });

    it("skal runde av ved flere desimaler enn spesifisert", () => {
      expect(formaterTilNorskBelop(1.999, 2)).toBe("2,00");
    });
  });

  describe("formaterTilNorskBelopUtenDesimaler", () => {
    it("skal formatere tall uten desimaler", () => {
      expect(formaterTilNorskBelopUtenDesimaler(1234.56)).toBe("1\u00A0235");
    });

    it("skal formatere hele tall", () => {
      expect(formaterTilNorskBelopUtenDesimaler(1234)).toBe("1\u00A0234");
    });

    it("skal returnere undefined for undefined input", () => {
      expect(formaterTilNorskBelopUtenDesimaler(undefined)).toBe(undefined);
    });

    it("skal formatere store tall", () => {
      expect(formaterTilNorskBelopUtenDesimaler(1234567)).toBe("1\u00A0234\u00A0567");
    });

    it("skal formatere negative tall", () => {
      expect(formaterTilNorskBelopUtenDesimaler(-1234.56)).toBe("\u22121\u00A0235");
    });

    it("skal runde av", () => {
      expect(formaterTilNorskBelopUtenDesimaler(1234.4)).toBe("1\u00A0234");
      expect(formaterTilNorskBelopUtenDesimaler(1234.5)).toBe("1\u00A0235");
    });

    it("skal håndtere null", () => {
      expect(formaterTilNorskBelopUtenDesimaler(0)).toBe("0");
    });
  });
});
