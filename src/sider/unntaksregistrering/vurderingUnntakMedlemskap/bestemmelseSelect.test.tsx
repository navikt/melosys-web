import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import MKV from "../../../melosyskodeverk";

vi.mock("../../../navFrontend", () => ({
  Row: ({ children }: any) => <div>{children}</div>,
  Column: ({ children }: any) => <div>{children}</div>,
  BodyLong: ({ children }: any) => <span>{children}</span>,
}));

vi.mock("../../../felleskomponenter/forms", () => ({
  Select: ({ children, label, name }: any) => (
    <div>
      <label>{label}</label>
      <select data-testid={name}>{children}</select>
    </div>
  ),
}));

import { BestemmelseSelect } from "./bestemmelseSelect";

const defaultProps = {
  formValues: {},
  control: {} as any,
  bestemmelser: [],
  lagreBestemmelse: vi.fn(),
  lagreTrygdedekning: vi.fn(),
  redigerbart: true,
};

describe("BestemmelseSelect", () => {
  it("rendrer bestemmelse-select", () => {
    render(<BestemmelseSelect {...defaultProps} />);
    expect(screen.getByText("Bestemmelse")).toBeDefined();
  });

  it("rendrer bestemmelse-options fra kodeverk", () => {
    const bestemmelser = [
      { kode: "KODE_1", term: "Bestemmelse 1" },
      { kode: "KODE_2", term: "Bestemmelse 2" },
    ] as any;
    render(<BestemmelseSelect {...defaultProps} bestemmelser={bestemmelser} />);
    expect(screen.getByText("Bestemmelse 1")).toBeDefined();
    expect(screen.getByText("Bestemmelse 2")).toBeDefined();
  });

  it("viser dekning-tekst når bestemmelse er valgt (ikke USA/CAN unntak)", () => {
    const formValues = { bestemmelse: "EN_VANLIG_BESTEMMELSE" };
    render(<BestemmelseSelect {...defaultProps} formValues={formValues} />);
    expect(screen.getByText("Dekning")).toBeDefined();
  });

  it("viser dekning-select for USA Art 5.9", () => {
    const usaKode = MKV.Koder.lovvalgsbestemmelser.trygdeavtale.lovvalgsbestemmelser_trygdeavtale_us.USA_ART5_9;
    const formValues = { bestemmelse: usaKode };
    render(<BestemmelseSelect {...defaultProps} formValues={formValues} />);
    const selects = screen.getAllByRole("combobox");
    expect(selects).toHaveLength(2); // bestemmelse + dekning
  });

  it("viser dekning-select for Canada Art 11", () => {
    const canKode = MKV.Koder.lovvalgsbestemmelser.trygdeavtale.lovvalgsbestemmelser_trygdeavtale_ca.CAN_ART11;
    const formValues = { bestemmelse: canKode };
    render(<BestemmelseSelect {...defaultProps} formValues={formValues} />);
    const selects = screen.getAllByRole("combobox");
    expect(selects).toHaveLength(2);
  });

  it("skjuler dekning når ingen bestemmelse er valgt", () => {
    render(<BestemmelseSelect {...defaultProps} formValues={{}} />);
    expect(screen.queryByText("Dekning")).toBeNull();
  });
});
