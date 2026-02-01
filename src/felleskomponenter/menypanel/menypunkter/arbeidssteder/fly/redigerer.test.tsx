import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import MKV from "../../../../../melosyskodeverk";

vi.mock("../../../../../navFrontend", () => ({
  Row: ({ children }: any) => <div>{children}</div>,
  Column: ({ children }: any) => <div>{children}</div>,
}));

vi.mock("../../../../skjema", () => ({
  Input: ({ label }: any) => <div>{label}</div>,
  Select: ({ children, label }: any) => (
    <div>
      <label>{label}</label>
      <select>{children}</select>
    </div>
  ),
  LandVelger: ({ label }: any) => <div>{label}</div>,
}));

vi.mock("../sletterad", () => ({
  default: ({ onClick }: any) => <button onClick={onClick}>Slett</button>,
}));

import Redigerer from "./redigerer";

describe("Redigerer (fly)", () => {
  it("rendrer hjemmebase-input, flyvningstype-select og land-velger", () => {
    render(<Redigerer redigerbart={true} overordnetFeltNavn="fly[0]" slett={vi.fn()} />);
    expect(screen.getByText("Navn på hjemmebase")).toBeDefined();
    expect(screen.getByText("Type flyvninger")).toBeDefined();
    expect(screen.getByText("Hjemmebasens land")).toBeDefined();
  });

  it("rendrer flyvningstyper fra ekte MKV-kodeverk", () => {
    render(<Redigerer redigerbart={true} overordnetFeltNavn="fly[0]" slett={vi.fn()} />);
    const options = screen.getAllByRole("option");
    expect(options.length).toBe(MKV.KTObjects.flyvningstyper.length);
  });

  it("rendrer sletteknapp", () => {
    const slett = vi.fn();
    render(<Redigerer redigerbart={true} overordnetFeltNavn="fly[0]" slett={slett} />);
    expect(screen.getByText("Slett")).toBeDefined();
  });
});
