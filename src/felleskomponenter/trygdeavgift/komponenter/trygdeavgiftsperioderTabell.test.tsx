import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";

vi.mock("../../../navFrontend", () => ({
  Table: Object.assign(({ children }: any) => <table>{children}</table>, {
    Header: ({ children }: any) => <thead>{children}</thead>,
    Body: ({ children }: any) => <tbody>{children}</tbody>,
    Row: ({ children }: any) => <tr>{children}</tr>,
    HeaderCell: ({ children }: any) => <th>{children}</th>,
    DataCell: ({ children }: any) => <td>{children}</td>,
  }),
}));

vi.mock("../../../utils", () => ({
  _uuid: () => String(Math.random()),
  dato: {
    formatterDatoTilNorsk: (d: string) => d,
    sorterEtterISOFomDato: (a: any, b: any) => a.fom.localeCompare(b.fom),
  },
}));

vi.mock("../../../kodeverk", () => ({
  finnTermFraListe: (_liste: any, kode: string) => kode,
}));

vi.mock("../../../melosyskodeverk", () => ({
  default: { KTObjects: { trygdedekninger: [], inntektskildetype: [] } },
}));

vi.mock("../../spinner", () => ({
  Spinner: () => <span>Laster...</span>,
}));

import TrygdeavgiftsperioderTabell from "./trygdeavgiftsperioderTabell";

const lagPeriode = (fom: string, tom: string) => ({
  fom,
  tom,
  trygdedekning: "FULL",
  inntektskildetype: "LØNN",
  avgiftssats: "7.8",
  avgiftPerMd: "1234",
});

describe("TrygdeavgiftsperioderTabell", () => {
  it("returnerer null når perioder er undefined", () => {
    const { container } = render(<TrygdeavgiftsperioderTabell perioder={undefined} lagrePending={false} />);
    expect(container.innerHTML).toBe("");
  });

  it("rendrer headere med dekning-kolonne", () => {
    render(<TrygdeavgiftsperioderTabell perioder={[]} lagrePending={false} />);
    expect(screen.getByText("Trygdeperiode")).toBeDefined();
    expect(screen.getByText("Dekning")).toBeDefined();
    expect(screen.getByText("Sats")).toBeDefined();
    expect(screen.getByText("Avgift per md.")).toBeDefined();
  });

  it("skjuler dekning-kolonne for EØS-pensjonist", () => {
    render(<TrygdeavgiftsperioderTabell perioder={[]} lagrePending={false} erEøsPensjonist />);
    expect(screen.queryByText("Dekning")).toBeNull();
  });

  it("rendrer periodedata", () => {
    const perioder = [lagPeriode("2024-01-01", "2024-06-30")] as any;
    render(<TrygdeavgiftsperioderTabell perioder={perioder} lagrePending={false} />);
    expect(screen.getByText("2024-01-01 - 2024-06-30")).toBeDefined();
    expect(screen.getByText("7.8")).toBeDefined();
    expect(screen.getByText("1234")).toBeDefined();
  });

  it("viser spinner når lagrePending", () => {
    render(<TrygdeavgiftsperioderTabell perioder={[]} lagrePending={true} />);
    expect(screen.getByText("Laster...")).toBeDefined();
  });
});
