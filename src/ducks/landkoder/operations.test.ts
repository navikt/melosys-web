import { describe, it, expect } from "vitest";
import { hentLandkoder } from "./operations";

describe("landkoder operations", () => {
  it("hentLandkoder returnerer thunk", () => {
    expect(typeof hentLandkoder()).toBe("function");
  });
});
