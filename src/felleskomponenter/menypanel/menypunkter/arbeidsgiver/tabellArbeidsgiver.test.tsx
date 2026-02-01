import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";

vi.mock("../../../../navFrontend", () => ({
  Table: Object.assign(({ children }: any) => <table>{children}</table>, {
    Header: ({ children }: any) => <thead>{children}</thead>,
    Body: ({ children }: any) => <tbody>{children}</tbody>,
    Row: ({ children }: any) => <tr>{children}</tr>,
    HeaderCell: ({ children }: any) => <th>{children}</th>,
    DataCell: ({ children }: any) => <td>{children}</td>,
  }),
}));

vi.mock("../../../../utils", () => ({
  _uuid: () => String(Math.random()),
}));

vi.mock("@navikt/ds-react", () => ({
  Pagination: ({ page, onPageChange, count }: any) => (
    <div>
      <span>
        Side {page} av {count}
      </span>
      {page < count && <button onClick={() => onPageChange(page + 1)}>Neste</button>}
    </div>
  ),
}));

import { TabellArbeidsgiver } from "./tabellArbeidsgiver";

describe("TabellArbeidsgiver", () => {
  it("rendrer kolonnenavn som headere", () => {
    render(<TabellArbeidsgiver kolonneNavn={["Navn", "Orgnr"]} tabellData={[]} />);
    expect(screen.getByText("Navn")).toBeDefined();
    expect(screen.getByText("Orgnr")).toBeDefined();
  });

  it("rendrer alle rader uten paginering", () => {
    const data = [
      ["Firma A", "111"],
      ["Firma B", "222"],
      ["Firma C", "333"],
    ];
    render(<TabellArbeidsgiver kolonneNavn={["Navn", "Orgnr"]} tabellData={data} />);
    expect(screen.getByText("Firma A")).toBeDefined();
    expect(screen.getByText("Firma B")).toBeDefined();
    expect(screen.getByText("Firma C")).toBeDefined();
  });

  it("viser kun første side med paginering", () => {
    const data = [
      ["A", "1"],
      ["B", "2"],
      ["C", "3"],
    ];
    render(<TabellArbeidsgiver kolonneNavn={["Navn", "Nr"]} tabellData={data} linjerPerSide={2} />);
    expect(screen.getByText("A")).toBeDefined();
    expect(screen.getByText("B")).toBeDefined();
    expect(screen.queryByText("C")).toBeNull();
  });

  it("navigerer til neste side", () => {
    const data = [
      ["A", "1"],
      ["B", "2"],
      ["C", "3"],
    ];
    render(<TabellArbeidsgiver kolonneNavn={["Navn", "Nr"]} tabellData={data} linjerPerSide={2} />);
    fireEvent.click(screen.getByText("Neste"));
    expect(screen.getByText("C")).toBeDefined();
    expect(screen.queryByText("A")).toBeNull();
  });

  it("viser ikke paginering når data passer på én side", () => {
    const data = [["A", "1"]];
    render(<TabellArbeidsgiver kolonneNavn={["Navn", "Nr"]} tabellData={data} linjerPerSide={5} />);
    expect(screen.queryByText("Neste")).toBeNull();
  });
});
