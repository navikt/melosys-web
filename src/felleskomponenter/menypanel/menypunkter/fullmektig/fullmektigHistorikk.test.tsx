import { describe, it, expect, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import MKV from "../../../../melosyskodeverk";

vi.mock("react-redux", () => ({
  useSelector: vi.fn(() => "SAK123"),
}));

vi.mock("../../../../ducks/fagsaker", () => ({
  fagsakSelectors: { SaksnummerSelector: () => "SAK123" },
}));

import { hentFullmektigHistorikk } from "../../../../services/modules/fagsaker/fagsak";

vi.mock("../../../../services/modules/fagsaker/fagsak", () => ({
  hentFullmektigHistorikk: vi.fn(() => Promise.resolve([])),
}));

vi.mock("../../../../kodeverk", () => ({
  kodeTilTerm: (kode: string, ktObjects: any[]) => {
    const found = ktObjects.find((o: any) => o.kode === kode);
    return found?.term ?? kode;
  },
}));

vi.mock("../../../../navFrontend", () => ({
  Table: Object.assign(({ children }: any) => <table>{children}</table>, {
    Header: ({ children }: any) => <thead>{children}</thead>,
    Body: ({ children }: any) => <tbody>{children}</tbody>,
    Row: ({ children }: any) => <tr>{children}</tr>,
    HeaderCell: ({ children }: any) => <th>{children}</th>,
    DataCell: ({ children }: any) => <td>{children}</td>,
  }),
}));

vi.mock("../../../../utils/dato", () => ({
  formatterDatoTilNorsk: (d: string) => d ?? "",
}));

import FullmektigHistorikk from "./fullmektigHistorikk";

describe("FullmektigHistorikk", () => {
  const defaultProps = {
    finnOrganisasjonAdresse: vi.fn(),
    finnPersonAdresse: vi.fn(),
  };

  it("rendrer tabellheader med kolonner", async () => {
    render(<FullmektigHistorikk {...defaultProps} />);
    expect(screen.getByText("Registrert fra")).toBeDefined();
    expect(screen.getByText("Registrert til")).toBeDefined();
    expect(screen.getByText("Fullmakt")).toBeDefined();
    expect(screen.getByText("Fullmektig Org.nr./F.nr.")).toBeDefined();
    await waitFor(() => {
      expect(hentFullmektigHistorikk).toHaveBeenCalled();
    });
  });

  it("rendrer tom tabell når ingen historikk", async () => {
    const { container } = render(<FullmektigHistorikk {...defaultProps} />);
    await waitFor(() => {
      expect(hentFullmektigHistorikk).toHaveBeenCalled();
    });
    const rows = container.querySelectorAll("tbody tr");
    expect(rows).toHaveLength(0);
  });

  it("verifiserer at MKV fullmaktstype-koder eksisterer", () => {
    expect(MKV.KTObjects.fullmaktstype.length).toBeGreaterThan(0);
    expect(MKV.KTObjects.fullmaktstype[0]).toHaveProperty("kode");
    expect(MKV.KTObjects.fullmaktstype[0]).toHaveProperty("term");
  });
});
