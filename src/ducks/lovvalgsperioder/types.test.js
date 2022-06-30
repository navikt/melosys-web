/* eslint-disable */
import * as Types from "./types";

describe("test lovvalgsperioder/types.js", () => {
  describe("types.ts", () => {
    test("OK", () => {
      expect(Types.OK).toEqual("lovvalgsperioder/OK");
    });

    test("PENDING", () => {
      expect(Types.PENDING).toEqual("lovvalgsperioder/PENDING");
    });

    test("FEILET", () => {
      expect(Types.FEILET).toEqual("lovvalgsperioder/FEILET");
    });
  });
});
