import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";

vi.mock("../../../../felleskomponenter/oppgaveliste/behandlingOppgave", () => ({
  default: ({ oppgave }: any) => <div>{oppgave?.tittel}</div>,
}));

vi.mock("../../../../felleskomponenter/sorterbarListe", () => ({
  default: ({ elementer, sortingLegend }: any) => (
    <div>
      <span>{sortingLegend}</span>
      <span>Antall: {elementer?.length ?? 0}</span>
    </div>
  ),
}));

import { BehandlingOppgaver } from "./behandlingOppgaver";

describe("BehandlingOppgaver", () => {
  it("rendrer SorterbarListe med sorteringstekst", () => {
    const props = {
      mineSaker: { saksbehandling: [] },
      landkoder: [],
    } as any;
    render(<BehandlingOppgaver {...props} />);
    expect(screen.getByText("Sorter behandlinger etter frist:")).toBeDefined();
  });

  it("sender saksbehandling-elementer til SorterbarListe", () => {
    const props = {
      mineSaker: { saksbehandling: [{ id: 1 }, { id: 2 }] },
      landkoder: [],
    } as any;
    render(<BehandlingOppgaver {...props} />);
    expect(screen.getByText("Antall: 2")).toBeDefined();
  });

  it("håndterer tom saksbehandling", () => {
    const props = {
      mineSaker: { saksbehandling: [] },
      landkoder: [],
    } as any;
    render(<BehandlingOppgaver {...props} />);
    expect(screen.getByText("Antall: 0")).toBeDefined();
  });
});
