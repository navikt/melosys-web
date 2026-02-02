import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";

vi.mock("../../../../../../navFrontend", () => ({
  Table: Object.assign(({ children }: any) => <table>{children}</table>, {
    Header: ({ children }: any) => <thead>{children}</thead>,
    Body: ({ children }: any) => <tbody>{children}</tbody>,
    Row: ({ children }: any) => <tr>{children}</tr>,
    HeaderCell: ({ children }: any) => <th>{children}</th>,
    DataCell: ({ children }: any) => <td>{children}</td>,
  }),
}));

vi.mock("../../../../../../utils", () => ({
  _uuid: () => "mock-uuid",
}));

vi.mock("../../../../../../utils/streng", () => ({
  storeForbokstaver: (s: string) => s,
}));

vi.mock("../../../../../../graphql", () => ({}));

vi.mock("../ident", () => ({
  default: ({ ident }: any) => <span>{ident}</span>,
}));

vi.mock("../../../../tags", () => ({
  Under18Aar: () => <span>Under 18</span>,
}));

import { BarnTable } from "./barnTable";

describe("BarnTable", () => {
  it("rendrer tabellheadere", () => {
    render(<BarnTable barnListe={[]} />);
    expect(screen.getByText("Navn")).toBeDefined();
    expect(screen.getByText("F.nr./d-nr.")).toBeDefined();
    expect(screen.getByText("Foreldreansvar")).toBeDefined();
    expect(screen.getByText("F.nr. annen forelder")).toBeDefined();
  });

  it("rendrer barn-data", () => {
    const liste = [
      {
        navn: "Ola Junior",
        ident: "01010112345",
        foreldreansvar: "felles",
        fnrAnnenForelder: "99999999999",
        alder: 10,
      },
    ] as any;
    render(<BarnTable barnListe={liste} />);
    expect(screen.getByText("Ola Junior")).toBeDefined();
    expect(screen.getByText("01010112345")).toBeDefined();
    expect(screen.getByText("felles")).toBeDefined();
    expect(screen.getByText("99999999999")).toBeDefined();
    expect(screen.getByText("Under 18")).toBeDefined();
  });

  it("viser ikke Under18-tag for barn over 18", () => {
    const liste = [{ navn: "Voksen Barn", ident: "01010100000", alder: 20 }] as any;
    render(<BarnTable barnListe={liste} />);
    expect(screen.queryByText("Under 18")).toBeNull();
  });
});
