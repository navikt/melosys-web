import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";

vi.mock("../../navFrontend", () => ({
  Table: Object.assign(({ children }: any) => <table>{children}</table>, {
    Row: ({ children }: any) => <tr>{children}</tr>,
    DataCell: ({ children }: any) => <td>{children}</td>,
  }),
  Checkbox: ({ children, onChange, checked, disabled }: any) => (
    <label>
      <input type="checkbox" onChange={onChange} checked={checked} disabled={disabled} />
      {children}
    </label>
  ),
}));

vi.mock("../../utils", () => ({
  dato: { formatterDatoTilNorsk: (d: string) => d },
}));

vi.mock("../pdfLink", () => ({
  default: ({ tittel }: any) => <a>{tittel}</a>,
}));

vi.mock("../pdfLink/pdfLinkStandardvedlegg", () => ({
  default: ({ standardvedlegg }: any) => <a>{standardvedlegg.navn}</a>,
}));

import VedleggVelgerRow from "./vedleggVelgerRow";

const renderInTable = (ui: React.ReactElement) =>
  render(
    <table>
      <tbody>{ui}</tbody>
    </table>,
  );

describe("VedleggVelgerRow", () => {
  it("rendrer fysisk dokument med PdfLink", () => {
    const vedlegg = { journalpostID: "jp1", dokumentID: "d1", tittel: "Vedlegg.pdf", dato: "2024-01-01" } as any;
    renderInTable(
      <VedleggVelgerRow vedlegg={vedlegg} leggTilVedlegg={vi.fn()} slettVedlegg={vi.fn()} vedleggErMarkert={false} />,
    );
    expect(screen.getByText("Vedlegg.pdf")).toBeDefined();
    expect(screen.getByText("2024-01-01")).toBeDefined();
  });

  it("rendrer standardvedlegg med PdfLinkStandardvedlegg", () => {
    const vedlegg = { navn: "Standard.pdf" } as any;
    renderInTable(
      <VedleggVelgerRow vedlegg={vedlegg} leggTilVedlegg={vi.fn()} slettVedlegg={vi.fn()} vedleggErMarkert={false} />,
    );
    expect(screen.getByText("Standard.pdf")).toBeDefined();
  });

  it("kaller leggTilVedlegg ved avhuking", () => {
    const leggTil = vi.fn();
    renderInTable(
      <VedleggVelgerRow
        vedlegg={{ navn: "V" } as any}
        leggTilVedlegg={leggTil}
        slettVedlegg={vi.fn()}
        vedleggErMarkert={false}
      />,
    );
    fireEvent.click(screen.getByRole("checkbox"));
    expect(leggTil).toHaveBeenCalledOnce();
  });

  it("kaller slettVedlegg ved avhuking av markert vedlegg", () => {
    const slett = vi.fn();
    renderInTable(
      <VedleggVelgerRow
        vedlegg={{ navn: "V" } as any}
        leggTilVedlegg={vi.fn()}
        slettVedlegg={slett}
        vedleggErMarkert={true}
      />,
    );
    fireEvent.click(screen.getByRole("checkbox"));
    expect(slett).toHaveBeenCalledOnce();
  });
});
