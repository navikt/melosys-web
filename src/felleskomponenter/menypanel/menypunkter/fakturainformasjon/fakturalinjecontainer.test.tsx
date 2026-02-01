import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";

vi.mock("../../../kopierbarTekst", () => ({
  default: ({ children }: any) => <span>{children}</span>,
}));

vi.mock("../../../../utils", () => ({
  _uuid: () => String(Math.random()),
  _isEmpty: (val: any) => !val || val.length === 0,
  formaterTilNorskBelop: (val: number) => `${val} kr`,
}));

vi.mock("../../../../navFrontend", () => ({
  Alert: ({ children }: any) => <div>{children}</div>,
  Table: Object.assign(({ children }: any) => <table>{children}</table>, {
    Header: ({ children }: any) => <thead>{children}</thead>,
    Body: ({ children }: any) => <tbody>{children}</tbody>,
    Row: ({ children }: any) => <tr>{children}</tr>,
    HeaderCell: ({ children }: any) => <th>{children}</th>,
    DataCell: ({ children }: any) => <td>{children}</td>,
  }),
}));

import { FakturaLinjeContainer } from "./fakturalinjecontainer";

describe("FakturaLinjeContainer", () => {
  it("viser fakturanummer når det finnes", () => {
    const faktura = { eksternFakturaNummer: "F-123", fakturaLinje: [] } as any;
    render(<FakturaLinjeContainer faktura={faktura} />);
    expect(screen.getByText("F-123")).toBeDefined();
  });

  it("viser strek og info-alert når fakturanummer mangler", () => {
    const faktura = { eksternFakturaNummer: null, fakturaLinje: [] } as any;
    render(<FakturaLinjeContainer faktura={faktura} />);
    expect(screen.getByText(/Fakturanr/)).toBeDefined();
    expect(screen.getByText(/Fakturanummer er bare kjent/)).toBeDefined();
  });

  it("rendrer fakturalinjer med beløp", () => {
    const faktura = {
      eksternFakturaNummer: "F-1",
      fakturaLinje: [{ beskrivelse: "Linje 1", antall: 3, enhetsprisPerManed: 1000, belop: 3000 }],
    } as any;
    render(<FakturaLinjeContainer faktura={faktura} />);
    expect(screen.getByText("Linje 1")).toBeDefined();
    expect(screen.getByText("3")).toBeDefined();
    expect(screen.getByText("1000 kr")).toBeDefined();
    expect(screen.getAllByText("3000 kr")).toHaveLength(2);
    expect(screen.getByText("Totalt")).toBeDefined();
  });
});
