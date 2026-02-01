import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";

vi.mock("../../../../adresser/strukturertAdresse", () => ({
  default: ({ adresse }: any) => (
    <div>
      <span>{adresse.gate}</span>
      <span>{adresse.land}</span>
    </div>
  ),
}));

import UtfyltAdresse from "./utfyltadresse";

describe("UtfyltAdresse", () => {
  it("sender adresse videre til StrukturertAdresseKomponent", () => {
    const adresse = { gate: "Gateveien 1", land: "Norge" } as any;
    render(<UtfyltAdresse adresse={adresse} />);
    expect(screen.getByText("Gateveien 1")).toBeDefined();
    expect(screen.getByText("Norge")).toBeDefined();
  });
});
