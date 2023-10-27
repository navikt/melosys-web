/* eslint-disable */
import * as Types from "./types";

describe("test vilkar/types.ts", () => {
  describe("types.ts", () => {
    test("OK", () => {
      expect(Types.OK).toEqual("vilkar/OK");
    });

    test("PENDING", () => {
      expect(Types.PENDING).toEqual("vilkar/PENDING");
    });

    test("FEILET", () => {
      expect(Types.FEILET).toEqual("vilkar/FEILET");
    });
  });
});
