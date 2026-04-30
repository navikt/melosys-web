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
  RadioGroup: ({ legend, children, onChange }: any) => (
    <div>
      <label>{legend}</label>
      <select onChange={(e: any) => onChange?.(e.target.value)}>{children}</select>
    </div>
  ),
  LandVelger: ({ label }: any) => <div>{label}</div>,
}));

vi.mock("../sletterad", () => ({
  default: ({ onClick }: any) => <button onClick={onClick}>Slett</button>,
}));

import Redigerer from "./redigerer";

const { INNENRIKS, UTENRIKS } = MKV.Koder.begrunnelser.fartsomrader;

describe("Redigerer (skip)", () => {
  it("rendrer skip-input, yrke-input og fartsområde-radio", () => {
    render(
      <Redigerer
        {...({ redigerbart: true, overordnetFeltNavn: "skip[0]", slett: vi.fn(), settVerdi: vi.fn() } as any)}
      />,
    );
    expect(screen.getByText("Navn på skip")).toBeDefined();
    expect(screen.getByText("Yrke")).toBeDefined();
    expect(screen.getByText("Fartsområde")).toBeDefined();
  });

  it("rendrer fartsområder fra ekte MKV-kodeverk", () => {
    render(
      <Redigerer
        {...({ redigerbart: true, overordnetFeltNavn: "skip[0]", slett: vi.fn(), settVerdi: vi.fn() } as any)}
      />,
    );
    const options = screen.getAllByRole("option");
    expect(options.length).toBe(MKV.KTObjects.begrunnelser.fartsomrader.length);
  });

  it("viser territorialfarvann-velger for innenriks", () => {
    render(
      <Redigerer
        redigerbart={true}
        overordnetFeltNavn="skip[0]"
        slett={vi.fn()}
        settVerdi={vi.fn()}
        verdier={{ fartsomradeKode: INNENRIKS } as any}
      />,
    );
    expect(screen.getByText("Lands territorialfarvann")).toBeDefined();
  });

  it("viser flaggstat-velger for utenriks", () => {
    render(
      <Redigerer
        redigerbart={true}
        overordnetFeltNavn="skip[0]"
        slett={vi.fn()}
        settVerdi={vi.fn()}
        verdier={{ fartsomradeKode: UTENRIKS } as any}
      />,
    );
    expect(screen.getByText("Flaggstat")).toBeDefined();
  });
});
