import { describe, it, expect } from "vitest";
import { getParam, toObject } from "./queryString";

describe("queryString", () => {
  describe("getParam", () => {
    it("skal hente parameter fra query string", () => {
      const location = { search: "?foo=bar&baz=qux" };
      const result = getParam(location, "foo");

      expect(result).toBe("bar");
    });

    it("skal hente annen parameter fra query string", () => {
      const location = { search: "?foo=bar&baz=qux" };
      const result = getParam(location, "baz");

      expect(result).toBe("qux");
    });

    it("skal returnere undefined for parameter som ikke finnes", () => {
      const location = { search: "?foo=bar" };
      const result = getParam(location, "missing");

      expect(result).toBeUndefined();
    });

    it("skal håndtere tom query string", () => {
      const location = { search: "" };
      const result = getParam(location, "foo");

      expect(result).toBeUndefined();
    });

    it("skal håndtere query string uten spørsmålstegn", () => {
      const location = { search: "foo=bar" };
      const result = getParam(location, "foo");

      expect(result).toBe("bar");
    });

    it("skal håndtere parameter med tall", () => {
      const location = { search: "?id=123" };
      const result = getParam(location, "id");

      expect(result).toBe("123");
    });

    it("skal håndtere parameter med spesialtegn", () => {
      const location = { search: "?name=John%20Doe" };
      const result = getParam(location, "name");

      expect(result).toBe("John Doe");
    });

    it("skal håndtere flere parametere", () => {
      const location = { search: "?a=1&b=2&c=3&d=4" };

      expect(getParam(location, "a")).toBe("1");
      expect(getParam(location, "b")).toBe("2");
      expect(getParam(location, "c")).toBe("3");
      expect(getParam(location, "d")).toBe("4");
    });

    it("skal håndtere parameter med tom verdi", () => {
      const location = { search: "?foo=" };
      const result = getParam(location, "foo");

      expect(result).toBe("");
    });

    it("skal håndtere parameter uten verdi", () => {
      const location = { search: "?foo" };
      const result = getParam(location, "foo");

      expect(result).toBe("");
    });

    it("skal håndtere URL-encoded verdier", () => {
      const location = { search: "?url=https%3A%2F%2Fexample.com" };
      const result = getParam(location, "url");

      expect(result).toBe("https://example.com");
    });

    it("skal håndtere norske tegn", () => {
      const location = { search: "?navn=Ærlighet%20Ønskelig%20Åpenhet" };
      const result = getParam(location, "navn");

      expect(result).toBe("Ærlighet Ønskelig Åpenhet");
    });

    it("skal håndtere array-lignende parametere", () => {
      const location = { search: "?id=1&id=2&id=3" };
      const result = getParam(location, "id");

      // qs.parse handles arrays
      expect(result).toEqual(["1", "2", "3"]);
    });
  });

  describe("toObject", () => {
    it("skal parse query string til objekt", () => {
      const location = { search: "?foo=bar&baz=qux" };
      const result = toObject(location);

      expect(result).toEqual({
        foo: "bar",
        baz: "qux",
      });
    });

    it("skal returnere tomt objekt for tom query string", () => {
      const location = { search: "" };
      const result = toObject(location);

      expect(result).toEqual({});
    });

    it("skal håndtere query string uten spørsmålstegn", () => {
      const location = { search: "foo=bar" };
      const result = toObject(location);

      expect(result).toEqual({ foo: "bar" });
    });

    it("skal håndtere flere parametere", () => {
      const location = { search: "?a=1&b=2&c=3" };
      const result = toObject(location);

      expect(result).toEqual({
        a: "1",
        b: "2",
        c: "3",
      });
    });

    it("skal håndtere URL-encoded verdier", () => {
      const location = { search: "?name=John%20Doe&city=New%20York" };
      const result = toObject(location);

      expect(result).toEqual({
        name: "John Doe",
        city: "New York",
      });
    });

    it("skal håndtere parametere med tomme verdier", () => {
      const location = { search: "?foo=&bar=baz" };
      const result = toObject(location);

      expect(result).toEqual({
        foo: "",
        bar: "baz",
      });
    });

    it("skal håndtere array-parametere", () => {
      const location = { search: "?id=1&id=2&id=3" };
      const result = toObject(location);

      expect(result).toEqual({
        id: ["1", "2", "3"],
      });
    });

    it("skal håndtere kompleks query string", () => {
      const location = { search: "?page=1&limit=10&sort=name&order=asc" };
      const result = toObject(location);

      expect(result).toEqual({
        page: "1",
        limit: "10",
        sort: "name",
        order: "asc",
      });
    });

    it("skal håndtere parametere med spesialtegn", () => {
      const location = { search: "?email=user%40example.com&url=https%3A%2F%2Fexample.com" };
      const result = toObject(location);

      expect(result).toEqual({
        email: "user@example.com",
        url: "https://example.com",
      });
    });

    it("skal håndtere norske tegn", () => {
      const location = { search: "?fornavn=Ørjan&etternavn=Åse" };
      const result = toObject(location);

      expect(result).toEqual({
        fornavn: "Ørjan",
        etternavn: "Åse",
      });
    });

    it("skal håndtere boolean-lignende verdier", () => {
      const location = { search: "?active=true&disabled=false" };
      const result = toObject(location);

      expect(result).toEqual({
        active: "true",
        disabled: "false",
      });
    });

    it("skal håndtere tall som verdier", () => {
      const location = { search: "?id=123&count=456" };
      const result = toObject(location);

      expect(result).toEqual({
        id: "123",
        count: "456",
      });
    });
  });
});
