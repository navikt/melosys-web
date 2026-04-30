import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";

vi.mock("../../../../../navFrontend", () => ({
  Row: ({ children }: any) => <div>{children}</div>,
  Column: ({ children }: any) => <div>{children}</div>,
  Radio: ({ children, value }: any) => <option value={String(value)}>{children}</option>,
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

describe("Redigerer (fly)", () => {
  it("rendrer hjemmebase-input og land-velger", () => {
    render(<Redigerer {...({ redigerbart: true, overordnetFeltNavn: "fly[0]", slett: vi.fn() } as any)} />);
    expect(screen.getByText("Navn på hjemmebase")).toBeDefined();
    expect(screen.getByText("Hjemmebasens land")).toBeDefined();
  });

  it("rendrer spørsmål om vanlig hjemmebase", () => {
    render(<Redigerer {...({ redigerbart: true, overordnetFeltNavn: "fly[0]", slett: vi.fn() } as any)} />);
    expect(screen.getByText("Er dette hjemmebasen arbeidstakeren jobber fra til vanlig?")).toBeDefined();
  });

  it("viser vanlig-hjemmebase-felter når svar er nei", () => {
    render(
      <Redigerer
        {...({
          redigerbart: true,
          overordnetFeltNavn: "fly[0]",
          slett: vi.fn(),
          verdier: { erVanligHjemmebase: false },
        } as any)}
      />,
    );
    expect(screen.getByText("Vanlig hjemmebase — navn")).toBeDefined();
    expect(screen.getByText("Vanlig hjemmebase — land")).toBeDefined();
  });

  it("rendrer sletteknapp", () => {
    const slett = vi.fn();
    render(<Redigerer {...({ redigerbart: true, overordnetFeltNavn: "fly[0]", slett } as any)} />);
    expect(screen.getByText("Slett")).toBeDefined();
  });
});
