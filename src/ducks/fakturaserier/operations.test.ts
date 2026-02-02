import { describe, it, expect } from "vitest";
import { hentFakturaserier, hentAlleFakturaserierForSak, resetFakturaserier } from "./operations";
import * as Types from "./types";

describe("fakturaserier operations", () => {
  it("hentFakturaserier returnerer thunk", () => {
    expect(typeof hentFakturaserier("ref123")).toBe("function");
  });

  it("resetFakturaserier returnerer RESET action", () => {
    expect(resetFakturaserier()).toEqual({ type: Types.RESET });
  });

  it("hentAlleFakturaserierForSak returnerer thunk", () => {
    expect(typeof hentAlleFakturaserierForSak("SAK-123")).toBe("function");
  });
});
