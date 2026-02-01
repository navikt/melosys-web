import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";

vi.mock("./ikkeEditerbareArbeidPaaLandSporsmal", () => ({
  default: () => <div>IkkeEditerbareSpørsmål</div>,
}));

import RedigeringUtfortPreElementer from "./redigeringUtfortPreElementer";

describe("RedigeringUtfortPreElementer", () => {
  it("rendrer IkkeEditerbareArbeidPaaLandSporsmal", () => {
    render(<RedigeringUtfortPreElementer />);
    expect(screen.getByText("IkkeEditerbareSpørsmål")).toBeDefined();
  });
});
