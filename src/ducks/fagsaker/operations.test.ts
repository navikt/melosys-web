import { describe, it, expect } from "vitest";
import { hent, lagNySak, lagNyBehandlingForSak, resetFagsakState } from "./operations";
import * as Types from "./types";

describe("fagsaker operations", () => {
  it("hent returnerer thunk", () => {
    expect(typeof hent("123")).toBe("function");
  });

  it("lagNySak returnerer thunk", () => {
    expect(typeof lagNySak({} as any)).toBe("function");
  });

  it("lagNyBehandlingForSak returnerer thunk", () => {
    expect(typeof lagNyBehandlingForSak("123", {} as any)).toBe("function");
  });

  it("resetFagsakState returnerer RESET action", () => {
    expect(resetFagsakState()).toEqual({ type: Types.RESET });
  });
});
