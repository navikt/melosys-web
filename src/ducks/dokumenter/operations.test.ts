import { describe, it, expect, vi } from "vitest";
import { resetDokument, hentDokumentOversikt } from "./operations";
import * as Types from "./types";

describe("dokumenter operations", () => {
  it("resetDokument dispatcher RESET action", () => {
    const dispatch = vi.fn();
    (resetDokument() as any)(dispatch);
    expect(dispatch).toHaveBeenCalledWith({ type: Types.RESET });
  });

  it("hentDokumentOversikt returnerer thunk", () => {
    expect(typeof hentDokumentOversikt("123")).toBe("function");
  });
});
