import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";

vi.mock("../../../navFrontend", () => ({
  Row: ({ children }: any) => <div>{children}</div>,
  Column: ({ children }: any) => <div>{children}</div>,
}));

vi.mock("./valgAlternativer", () => ({
  default: ({ feltKode }: any) => <div>Valg: {feltKode}</div>,
}));

vi.mock("./brevFelt", () => ({
  default: ({ felt }: any) => <div>BrevFelt: {felt.kode}</div>,
}));

import BrevValg from "./brevValg";

const defaultProps = {
  width: "12" as any,
  redigerbart: true,
  changeField: vi.fn(),
  finnValgAlternativ: vi.fn(() => ({ visFelt: true })),
};

describe("BrevValg", () => {
  it("rendrer ingenting når valgtBrev er undefined", () => {
    const { container } = render(<BrevValg {...defaultProps} formValues={{} as any} />);
    expect(container.textContent).toBe("");
  });

  it("rendrer ValgAlternativer og BrevFelt for felt med valg", () => {
    const formValues = {
      valgtBrev: {
        felter: [{ kode: "FELT_1", valg: [{ kode: "A" }], beskrivelse: "Desc", hjelpetekst: "" }],
      },
    } as any;
    render(<BrevValg {...defaultProps} formValues={formValues} />);
    expect(screen.getByText("Valg: FELT_1")).toBeDefined();
    expect(screen.getByText("BrevFelt: FELT_1")).toBeDefined();
  });

  it("skjuler BrevFelt for UTENLANDSK_TRYGDEMYNDIGHET_MOTTAKER", () => {
    const formValues = {
      valgtBrev: {
        felter: [{ kode: "UTENLANDSK_TRYGDEMYNDIGHET_MOTTAKER", valg: [{ kode: "X" }] }],
      },
    } as any;
    render(<BrevValg {...defaultProps} formValues={formValues} />);
    expect(screen.getByText("Valg: UTENLANDSK_TRYGDEMYNDIGHET_MOTTAKER")).toBeDefined();
    expect(screen.queryByText(/BrevFelt/)).toBeNull();
  });

  it("rendrer BrevFelt uten ValgAlternativer når valg er null", () => {
    const formValues = {
      valgtBrev: {
        felter: [{ kode: "FRITEKST", valg: null }],
      },
    } as any;
    render(
      <BrevValg {...defaultProps} formValues={formValues} finnValgAlternativ={vi.fn(() => ({ visFelt: true }))} />,
    );
    expect(screen.queryByText("Valg: FRITEKST")).toBeNull();
    expect(screen.getByText("BrevFelt: FRITEKST")).toBeDefined();
  });
});
