import { describe, it, expect, vi } from "vitest";
import { mixed, object, string } from "yup";

import { lagYupToReduxformErrorMapper } from "./lagYupToReduxformErrorMapper";

describe("lagYupToReduxformErrorMapper", () => {
  it("throw Error hvis schema er falsy", () => {
    expect(() => {
      lagYupToReduxformErrorMapper(null);
    }).toThrow();
  });

  describe("mapper", () => {
    it("returnerer et error-objekt som forventes av redux-form", () => {
      const schema = object().shape({
        verdi: string().required({ melding: "Verdi er påkrevd" }),
      });
      const mapYupToReduxformError = lagYupToReduxformErrorMapper(schema);

      expect(mapYupToReduxformError({})).toEqual({ verdi: { melding: "Verdi er påkrevd" } });

      // Test case for when 'verdi' (a string schema) receives an array
      const valuesWithArrayForVerdi = { verdi: ["ikkeEtNummer", 3] };
      const errorsForArrayInput = mapYupToReduxformError(valuesWithArrayForVerdi);

      // For debugging: log the structure of the errors
      // console.log('Errors for array input on string field:', JSON.stringify(errorsForArrayInput));

      // Expect that the 'verdi' field has an error
      expect(errorsForArrayInput).toHaveProperty("verdi");

      // Expect the error message for 'verdi' to be a string (Yup's default type error message)
      expect(typeof (errorsForArrayInput as any).verdi).toBe("string");

      // Expect the error message string to not be empty (and likely longer than 1 character)
      expect((errorsForArrayInput as any).verdi.length).toBeGreaterThan(1);
    });

    it("returnerer ingen feilmeldinger for et schema som matcher verdiene", () => {
      const schema = mixed();
      const mapYupToReduxformError = lagYupToReduxformErrorMapper(schema);

      expect(mapYupToReduxformError({})).toEqual({});
    });

    it("obfuskerer ikke errors som ikke er valideringsfeil(error.inner er undefined)", () => {
      const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
      const schema = mixed();
      schema.validateSync = () => {
        throw new Error("Feil");
      };
      const mapYupToReduxformError = lagYupToReduxformErrorMapper(schema);

      expect(() => {
        mapYupToReduxformError({});
      }).toThrowError(new Error("Feil"));
      consoleErrorSpy.mockRestore();
    });
  });
});
