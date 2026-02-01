import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";

vi.mock("../../../../../navFrontend", () => ({
  Table: Object.assign(({ children }: any) => <table>{children}</table>, {
    Header: ({ children }: any) => <thead>{children}</thead>,
    Body: ({ children }: any) => <tbody>{children}</tbody>,
    Row: ({ children }: any) => <tr>{children}</tr>,
    HeaderCell: ({ children }: any) => <th>{children}</th>,
    DataCell: ({ children }: any) => <td>{children}</td>,
  }),
}));

vi.mock("../../../../../utils", () => ({
  _uuid: () => String(Math.random()),
  dato: { formatterDatoTilNorsk: (d: string) => d ?? "" },
}));

vi.mock("../../../../chevronKnapp/chevronKnapp", () => ({
  default: ({ label, onChange }: any) => <button onClick={onChange}>{label}</button>,
}));

vi.mock("../../../../../graphql", () => ({}));

import StatsborgerskapTable from "./statsborgerskapTable";

const lagStatsborgerskap = (land: string, master: string) => ({
  land,
  master,
  kilde: "PDL",
  bekreftelsesdato: "2024-01-01",
  gyldigFraOgMed: "2020-01-01",
  gyldigTilOgMed: null,
  erHistorisk: false,
});

describe("StatsborgerskapTable", () => {
  it("rendrer tabellheadere for gyldig statsborgerskap", () => {
    render(<StatsborgerskapTable statsborgerskapList={[]} />);
    expect(screen.getByText("Land")).toBeDefined();
    expect(screen.getByText("Register")).toBeDefined();
    expect(screen.getByText("Kilde")).toBeDefined();
    expect(screen.getByText("Gyldig f.o.m.")).toBeDefined();
  });

  it("rendrer statsborgerskap-data", () => {
    const liste = [lagStatsborgerskap("Norge", "FREG")] as any;
    render(<StatsborgerskapTable statsborgerskapList={liste} />);
    expect(screen.getByText("Norge")).toBeDefined();
    expect(screen.getByText("FREG")).toBeDefined();
    expect(screen.getByText("PDL")).toBeDefined();
  });

  it("viser chevron for historisk modus", () => {
    render(<StatsborgerskapTable statsborgerskapList={[]} historisk />);
    expect(screen.getByText("Åpne historikk")).toBeDefined();
  });

  it("viser tabell etter klikk på Åpne historikk", () => {
    const liste = [lagStatsborgerskap("Sverige", "UDI")] as any;
    render(<StatsborgerskapTable statsborgerskapList={liste} historisk />);
    expect(screen.queryByText("Sverige")).toBeNull();
    fireEvent.click(screen.getByText("Åpne historikk"));
    expect(screen.getByText("Sverige")).toBeDefined();
  });

  it("viser periode med fom-tom for historisk", () => {
    const liste = [
      {
        ...lagStatsborgerskap("Danmark", "FREG"),
        gyldigFraOgMed: "2010-01-01",
        gyldigTilOgMed: "2020-12-31",
      },
    ] as any;
    render(<StatsborgerskapTable statsborgerskapList={liste} historisk />);
    fireEvent.click(screen.getByText("Åpne historikk"));
    expect(screen.getByText("Gyldig f.o.m. - t.o.m.")).toBeDefined();
    expect(screen.getByText("2010-01-01 - 2020-12-31")).toBeDefined();
  });
});
