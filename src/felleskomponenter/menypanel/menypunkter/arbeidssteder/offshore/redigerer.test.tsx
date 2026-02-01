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

describe("Redigerer (offshore)", () => {
  it("rendrer innretning-input, type-select og land-velger", () => {
    render(<Redigerer redigerbart={true} overordnetFeltNavn="offshore[0]" slett={vi.fn()} />);
    expect(screen.getByText("Navn på innretning")).toBeDefined();
    expect(screen.getByText("Type innretning")).toBeDefined();
    expect(screen.getByText("Lands sokkel")).toBeDefined();
  });

  it("rendrer innretningstyper fra ekte MKV-kodeverk", () => {
    render(<Redigerer redigerbart={true} overordnetFeltNavn="offshore[0]" slett={vi.fn()} />);
    const options = screen.getAllByRole("option");
    expect(options.length).toBe(MKV.KTObjects.innretningstyper.length);
  });
});
