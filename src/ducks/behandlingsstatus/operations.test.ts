import { describe, it, expect } from "vitest";
import { hentMuligeBehandlingsstatuser } from "./operations";

describe("behandlingsstatus operations", () => {
  it("hentMuligeBehandlingsstatuser returnerer thunk", () => {
    expect(typeof hentMuligeBehandlingsstatuser(1)).toBe("function");
  });
});
