import { describe, it, expect, vi } from "vitest";
import { avslåPgaManglendeOpplysninger } from "./avslag";

vi.mock("../../utils", () => ({
  postAsJson: vi.fn().mockResolvedValue({}),
}));

describe("avslag", () => {
  it("avslåPgaManglendeOpplysninger returnerer promise", () => {
    expect(avslåPgaManglendeOpplysninger(1, { fritekst: "test" })).toBeInstanceOf(Promise);
  });
});
