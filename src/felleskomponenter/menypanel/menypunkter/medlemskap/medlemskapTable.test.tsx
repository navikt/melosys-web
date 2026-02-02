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
  _uuid: () => "mock-uuid",
  dato: { formatterDatoTilNorsk: (d: string) => d ?? "" },
}));

vi.mock("../../../../kodeverk", () => ({
  objektTilTerm: (obj: any) => obj?.term ?? "",
}));

vi.mock("../../../chevronKnapp/chevronKnapp", () => ({
  default: ({ label, onChange }: any) => <button onClick={onChange}>{label}</button>,
}));

import MedlemskapTable from "./medlemskapTable";

const lagPeriode = (fom: string, tom: string, land: string) => ({
  periode: { fom, tom },
  land: { term: land },
  status: { term: "Gyldig" },
  grunnlagstype: { term: "EØS" },
});

describe("MedlemskapTable", () => {
  it("rendrer tabellheadere", () => {
    render(<MedlemskapTable perioder={[]} />);
    expect(screen.getByText("Fra og med")).toBeDefined();
    expect(screen.getByText("Til og med")).toBeDefined();
    expect(screen.getByText("Land")).toBeDefined();
    expect(screen.getByText("Status")).toBeDefined();
    expect(screen.getByText("Hjemmel")).toBeDefined();
  });

  it("viser maks 2 perioder som standard", () => {
    const perioder = [
      lagPeriode("2020-01-01", "2020-12-31", "Norge"),
      lagPeriode("2021-01-01", "2021-12-31", "Sverige"),
      lagPeriode("2022-01-01", "2022-12-31", "Danmark"),
    ] as any;
    render(<MedlemskapTable perioder={perioder} />);
    expect(screen.getByText("Norge")).toBeDefined();
    expect(screen.getByText("Sverige")).toBeDefined();
    expect(screen.queryByText("Danmark")).toBeNull();
  });

  it("viser alle perioder etter klikk på 'Vis flere'", () => {
    const perioder = [
      lagPeriode("2020-01-01", "2020-12-31", "Norge"),
      lagPeriode("2021-01-01", "2021-12-31", "Sverige"),
      lagPeriode("2022-01-01", "2022-12-31", "Danmark"),
    ] as any;
    render(<MedlemskapTable perioder={perioder} />);
    fireEvent.click(screen.getByText("Vis flere"));
    expect(screen.getByText("Danmark")).toBeDefined();
  });

  it("viser ikke chevron-knapp med 2 eller færre perioder", () => {
    const perioder = [lagPeriode("2020-01-01", "2020-12-31", "Norge")] as any;
    render(<MedlemskapTable perioder={perioder} />);
    expect(screen.queryByText("Vis flere")).toBeNull();
  });
});
