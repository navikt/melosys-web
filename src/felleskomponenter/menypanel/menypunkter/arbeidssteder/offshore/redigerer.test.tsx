import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import MKV from "../../../../../melosyskodeverk";

vi.mock("../../../../../navFrontend", () => ({
  Row: ({ children }: any) => <div>{children}</div>,
  Column: ({ children }: any) => <div>{children}</div>,
  Radio: ({ children, value }: any) => <option value={value}>{children}</option>,
}));

vi.mock("../../../../skjema", () => ({
  Input: ({ label }: any) => <div>{label}</div>,
  RadioGroup: ({ legend, children }: any) => (
    <div>
      <label>{legend}</label>
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
    render(<Redigerer {...({ redigerbart: true, overordnetFeltNavn: "offshore[0]", slett: vi.fn() } as any)} />);
    expect(screen.getByText("Navn på innretning")).toBeDefined();
    expect(screen.getByText("Type innretning")).toBeDefined();
    expect(screen.getByText("Lands sokkel")).toBeDefined();
  });

  it("rendrer innretningstyper fra ekte MKV-kodeverk", () => {
    render(<Redigerer {...({ redigerbart: true, overordnetFeltNavn: "offshore[0]", slett: vi.fn() } as any)} />);
    const options = screen.getAllByRole("option");
    expect(options.length).toBe(MKV.KTObjects.innretningstyper.length);
  });
});
