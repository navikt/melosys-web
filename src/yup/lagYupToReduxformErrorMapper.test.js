import { object, array, number, mixed } from "yup";

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
        verdi: array().of(number()).required({ melding: "Verdi er påkrevd" }),
      });
      const mapYupToReduxformError = lagYupToReduxformErrorMapper(schema);

      expect(mapYupToReduxformError({})).toEqual({ verdi: { melding: "Verdi er påkrevd" } });
      expect(
        mapYupToReduxformError({
          verdi: ["ikkeEtNummer", 3],
        }).verdi,
      ).toHaveLength(1);
    });

    it("returnerer ingen feilmeldinger for et schema som matcher verdiene", () => {
      const schema = mixed();
      const mapYupToReduxformError = lagYupToReduxformErrorMapper(schema);

      expect(mapYupToReduxformError({})).toEqual({});
    });

    it("obfuskerer ikke errors som ikke er valideringsfeil(error.inner er undefined)", () => {
      const schema = mixed();
      schema.validateSync = () => {
        throw new Error("Feil");
      };
      const mapYupToReduxformError = lagYupToReduxformErrorMapper(schema);

      expect(() => {
        mapYupToReduxformError({});
      }).toThrowError(new Error("Feil"));
    });
  });
});
