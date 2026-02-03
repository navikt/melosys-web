import { describe, it, expect } from "vitest";
import { hentKodeverkForFolketrygden } from "./operations";

describe("folketrygdenkodeverk operations", () => {
  it("hentKodeverkForFolketrygden returnerer thunk", () => {
    expect(typeof hentKodeverkForFolketrygden()).toBe("function");
  });
});
