import { describe, it, expect } from "vitest";
import * as SkjemaUtils from "./utils";

describe("Skjema utils", () => {
  describe("mapReduxFormFeilTilNavFeil", () => {
    it("returnerer undefined for manglende error", () => {
      const meta = {};
      expect(SkjemaUtils.mapReduxFormFeilTilNavFeil(meta)).toBeUndefined();
    });

    it("returnerer feilmelding-objekt for string-error", () => {
      const meta = { error: "Manglende felt" };
      expect(SkjemaUtils.mapReduxFormFeilTilNavFeil(meta)).toEqual(meta.error);
    });

    it("returnerer feilmelding-objekt for objekt-error", () => {
      const meta = { error: { melding: "Manglende felt" } };
      expect(SkjemaUtils.mapReduxFormFeilTilNavFeil(meta)).toEqual(meta.error.melding);
    });

    it("config submitFailed, touched, active kan tillate feilmelding å vises", () => {
      const configs = ["submitFailed", "touched", "active"];
      configs.forEach((config) => {
        const meta = {
          error: { melding: "Manglende felt" },
          [config]: true,
        };
        const errorConfig = { [config]: true };

        expect(SkjemaUtils.mapReduxFormFeilTilNavFeil(meta, errorConfig)).toEqual(meta.error.melding);
      });
    });

    it("config submitFailed, touched, active kan hindre feilmelding i å vises", () => {
      const configs = ["submitFailed", "touched", "active"];
      configs.forEach((config) => {
        const meta = {
          error: { melding: "Manglende felt" },
          [config]: true,
        };
        const errorConfig = { [config]: false };

        expect(SkjemaUtils.mapReduxFormFeilTilNavFeil(meta, errorConfig)).toBeUndefined();
      });
    });
  });
});
