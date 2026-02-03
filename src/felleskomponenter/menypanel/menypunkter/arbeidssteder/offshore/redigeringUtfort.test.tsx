import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";

vi.mock("../../../../../navFrontend", () => ({
  Table: Object.assign(({ children }: any) => <table>{children}</table>, {
    Header: ({ children }: any) => <thead>{children}</thead>,
    Body: ({ children }: any) => <tbody>{children}</tbody>,
    Row: ({ children }: any) => <tr>{children}</tr>,
    HeaderCell: ({ children }: any) => <th>{children}</th>,
    DataCell: ({ children }: any) => <td>{children}</td>,
  }),
}));

vi.mock("../../../../../kodeverk", () => ({
  kodeTilTerm: (_kode: string) => _kode,
  Form: {},
}));

vi.mock("../../../../../melosyskodeverk", () => ({
  default: { KTObjects: { innretningstyper: [], landkoder: [] } },
}));

import RedigeringUtfort from "./redigeringUtfort";

describe("offshore RedigeringUtfort", () => {
  it("rendrer tabellheadere", () => {
    render(<RedigeringUtfort verdier={[]} />);
    expect(screen.getByText("Navn på innretning")).toBeDefined();
    expect(screen.getByText("Type innretning")).toBeDefined();
    expect(screen.getByText("Lands sokkel")).toBeDefined();
  });

  it("rendrer rad med data", () => {
    const verdier = [{ enhetNavn: "Troll A", innretningstype: "PLATTFORM", innretningLandkode: "NO" }] as any;
    render(<RedigeringUtfort verdier={verdier} />);
    expect(screen.getByText("Troll A")).toBeDefined();
  });
});
