import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";

vi.mock("../../navFrontend", () => ({
  Table: Object.assign(({ children }: any) => <table>{children}</table>, {
    Header: ({ children }: any) => <thead>{children}</thead>,
    Body: ({ children }: any) => <tbody>{children}</tbody>,
    Row: ({ children }: any) => <tr>{children}</tr>,
    HeaderCell: ({ children }: any) => <th>{children}</th>,
    DataCell: ({ children }: any) => <td>{children}</td>,
  }),
  Heading: ({ children }: any) => <h3>{children}</h3>,
}));

vi.mock("../../utils", () => ({
  _isEmpty: (val: any) => !val || val.length === 0,
}));

vi.mock("./vedleggVelgerRow", () => ({
  default: ({ vedlegg, vedleggErMarkert }: any) => (
    <tr>
      <td data-testid={`vedlegg-${vedlegg.type || vedlegg.id}`} data-markert={String(vedleggErMarkert)}>
        {vedlegg.tittel || vedlegg.type}
      </td>
    </tr>
  ),
}));

import VedleggVelgerTable from "./vedleggVelgerTable";

const defaultProps = {
  valgteVedlegg: { standardvedlegg: null, saksvedlegg: [] },
  alleSaksvedlegg: [] as any[],
  standardvedlegg: [] as any[],
  slettSaksvedlegg: vi.fn(),
  slettStandardvedlegg: vi.fn(),
  leggTilSaksvedlegg: vi.fn(),
  velgStandardvedlegg: vi.fn(),
};

describe("VedleggVelgerTable", () => {
  it("viser tomme meldinger når ingen vedlegg", () => {
    render(<VedleggVelgerTable {...defaultProps} />);
    expect(screen.getByText("Fant ingen standardvedlegg")).toBeDefined();
    expect(screen.getByText("Fant ingen dokumenter tilknyttet saken")).toBeDefined();
  });

  it("rendrer standardvedlegg", () => {
    const standardvedlegg = [{ type: "STD_1", tittel: "Standard 1" }] as any;
    render(<VedleggVelgerTable {...defaultProps} standardvedlegg={standardvedlegg} />);
    expect(screen.getByText("Standardvedlegg")).toBeDefined();
    expect(screen.getByText("Standard 1")).toBeDefined();
    expect(screen.getByTestId("vedlegg-STD_1")).toHaveAttribute("data-markert", "false");
    expect(screen.queryByText("Fant ingen standardvedlegg")).toBeNull();
  });

  it("rendrer saksvedlegg", () => {
    const saksvedlegg = [{ id: "1", tittel: "Dok 1" }] as any;
    render(<VedleggVelgerTable {...defaultProps} alleSaksvedlegg={saksvedlegg} />);
    expect(screen.getByText("Dokumenter tilknyttet behandlingen")).toBeDefined();
    expect(screen.getByText("Dok 1")).toBeDefined();
    expect(screen.getByTestId("vedlegg-1")).toHaveAttribute("data-markert", "false");
  });

  it("markerer valgt standardvedlegg", () => {
    const standardvedlegg = [{ type: "STD_1" }] as any;
    const valgteVedlegg = { standardvedlegg: { type: "STD_1" }, saksvedlegg: [] };
    render(<VedleggVelgerTable {...defaultProps} standardvedlegg={standardvedlegg} valgteVedlegg={valgteVedlegg} />);
    expect(screen.getByTestId("vedlegg-STD_1")).toHaveAttribute("data-markert", "true");
  });
});
