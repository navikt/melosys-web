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

let uuidCounter = 0;
vi.mock("../../../../../../utils", () => ({
  _uuid: () => `mock-uuid-${++uuidCounter}`,
  dato: { formatterDatoTilNorsk: (d: string) => d ?? "" },
}));

vi.mock("../../../../../../graphql", () => ({}));

vi.mock("../ident", () => ({
  default: ({ ident }: any) => <span>{ident}</span>,
}));

import { EktefelleTable } from "./ektefelleTable";

describe("EktefelleTable", () => {
  it("rendrer tabellheadere", () => {
    render(<EktefelleTable ektefelleListe={[]} />);
    expect(screen.getByText("Navn")).toBeDefined();
    expect(screen.getByText("F.nr./d-nr.")).toBeDefined();
    expect(screen.getByText("Fra og med")).toBeDefined();
    expect(screen.getByText("Relasjon")).toBeDefined();
  });

  it("rendrer ektefelle-data", () => {
    const liste = [
      {
        navn: "Kari Nordmann",
        ident: "12345678901",
        sivilstand: { gyldigFraOgMed: "2020-01-01", type: "GIFT" },
      },
    ] as any;
    render(<EktefelleTable ektefelleListe={liste} />);
    expect(screen.getByText("Kari Nordmann")).toBeDefined();
    expect(screen.getByText("12345678901")).toBeDefined();
    expect(screen.getByText("GIFT")).toBeDefined();
  });
});
