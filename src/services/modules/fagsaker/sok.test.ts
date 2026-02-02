import { describe, it, expect, vi } from "vitest";
import { send } from "./sok";

const mockPostAsJson = vi.fn().mockResolvedValue([]);

vi.mock("../../utils", () => ({
  postAsJson: (...args: any[]) => mockPostAsJson(...args),
}));

describe("fagsaker sok", () => {
  it("send returnerer promise", () => {
    expect(send({ ident: "123", saksnummer: null, orgnr: null })).toBeInstanceOf(Promise);
  });

  it("send legger til aktiveBehandlinger query param når oppgitt", () => {
    send({ ident: null, saksnummer: null, orgnr: null }, true);
    expect(mockPostAsJson).toHaveBeenCalledWith(expect.stringContaining("aktiveBehandlinger=true"), expect.anything());
  });

  it("send bruker URL uten query param når aktiveBehandlinger ikke er oppgitt", () => {
    send({ ident: null, saksnummer: null, orgnr: null });
    expect(mockPostAsJson).toHaveBeenCalledWith(expect.not.stringContaining("aktiveBehandlinger"), expect.anything());
  });
});
