import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";

vi.mock("@navikt/ds-react", () => ({
  HStack: ({ children }: any) => <div>{children}</div>,
  VStack: ({ children }: any) => <div>{children}</div>,
}));

vi.mock("../behandlingsstatus", () => ({
  BehandlingsstatusMedSvarfrist: ({ behandlingsstatus }: any) => <span>{behandlingsstatus?.kode}</span>,
}));

vi.mock("../chevronKnapp/chevronKnapp", () => ({
  default: ({ label, onChange }: any) => <button onClick={onChange}>{label}</button>,
}));

import BehandlingerListe from "./behandlingerListe";

const lagBehandling = (id: number, tittel: string, status: string) => ({
  behandlingID: id,
  behandlingsstatus: { kode: status, term: status },
  svarFrist: null,
  behandlingstype: { kode: "TYPE", term: "Type" },
  tittel,
});

describe("BehandlingerListe", () => {
  it("viser pågående behandlinger som standard", () => {
    const behandlinger = [
      lagBehandling(1, "Aktiv sak", "PÅGÅR"),
      lagBehandling(2, "Avsluttet sak", "AVSLUTTET"),
    ] as any;
    render(<BehandlingerListe behandlingerForFagsak={behandlinger} />);
    expect(screen.getByText("Aktiv sak")).toBeDefined();
    expect(screen.queryByText("Avsluttet sak")).toBeNull();
  });

  it("viser første behandling når alle er avsluttet", () => {
    const behandlinger = [
      lagBehandling(1, "Første avsluttede", "AVSLUTTET"),
      lagBehandling(2, "Andre avsluttede", "AVSLUTTET"),
    ] as any;
    render(<BehandlingerListe behandlingerForFagsak={behandlinger} />);
    expect(screen.getByText("Første avsluttede")).toBeDefined();
    expect(screen.queryByText("Andre avsluttede")).toBeNull();
  });

  it("viser alle behandlinger etter klikk på vis-knapp", () => {
    const behandlinger = [
      lagBehandling(1, "Aktiv sak", "PÅGÅR"),
      lagBehandling(2, "Avsluttet sak", "AVSLUTTET"),
    ] as any;
    render(<BehandlingerListe behandlingerForFagsak={behandlinger} />);
    fireEvent.click(screen.getByText("Vis avsluttede behandlinger"));
    expect(screen.getByText("Avsluttet sak")).toBeDefined();
  });

  it("endrer knappetekst etter expand", () => {
    const behandlinger = [lagBehandling(1, "Aktiv", "PÅGÅR"), lagBehandling(2, "Avsluttet", "AVSLUTTET")] as any;
    render(<BehandlingerListe behandlingerForFagsak={behandlinger} />);
    fireEvent.click(screen.getByText("Vis avsluttede behandlinger"));
    expect(screen.getByText("Skjul avsluttede behandlinger")).toBeDefined();
  });
});
