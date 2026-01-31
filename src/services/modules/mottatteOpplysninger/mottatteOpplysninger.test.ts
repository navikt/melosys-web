import { describe, it, expect, vi } from "vitest";
import { hent, send } from "./mottatteOpplysninger";

vi.mock("../../utils", () => ({
  getAsJson: vi.fn().mockResolvedValue({}),
  postAsJson: vi.fn().mockResolvedValue({}),
}));

describe("mottatteOpplysninger", () => {
  it("hent returnerer promise", () => {
    expect(hent(1)).toBeInstanceOf(Promise);
  });

  it("send returnerer promise", () => {
    expect(send(1, {} as any)).toBeInstanceOf(Promise);
  });
});
