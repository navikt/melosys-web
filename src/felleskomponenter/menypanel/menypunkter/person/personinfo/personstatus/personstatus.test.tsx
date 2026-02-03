import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";

vi.mock("../../../../../../navFrontend", () => ({
  Column: ({ children }: any) => <div>{children}</div>,
  BodyLong: ({ children }: any) => <span>{children}</span>,
}));

vi.mock("../../../../../ui", () => ({
  Lenkeknapp: ({ children, onClick }: any) => <button onClick={onClick}>{children}</button>,
}));

vi.mock("./index", () => ({
  PersonstatusModal: ({ skalViseModal, aktivePersonstatuser, historiskePersonstatuser }: any) =>
    skalViseModal ? (
      <div>
        Modal åpen aktive={aktivePersonstatuser.length} historiske={historiskePersonstatuser.length}
      </div>
    ) : null,
}));

import Personstatus from "./personstatus";

const lagStatus = (tekst: string, erHistorisk: boolean) => ({
  kode: "kode",
  tekst,
  master: "FREG",
  kilde: "kilde",
  fregGyldighetstidspunkt: "2024-01-01",
  erHistorisk,
});

describe("Personstatus", () => {
  it("rendrer ingenting når status er undefined", () => {
    render(<Personstatus status={undefined} erLitenSkjerm={false} />);
    expect(screen.queryByText("Vis detaljer")).toBeNull();
  });

  it("viser aktiv personstatus tekst", () => {
    const status = [lagStatus("Bosatt", false)];
    render(<Personstatus status={status} erLitenSkjerm={false} />);
    expect(screen.getByText("Bosatt")).toBeDefined();
    expect(screen.getByText("Personstatus:")).toBeDefined();
  });

  it("viser fallback når ingen aktive statuser", () => {
    const status = [lagStatus("Utflyttet", true)];
    render(<Personstatus status={status} erLitenSkjerm={false} />);
    expect(screen.getByText("Ingen personstatus funnet")).toBeDefined();
  });

  it("åpner modal ved klikk på Vis detaljer", () => {
    const status = [lagStatus("Bosatt", false), lagStatus("Utflyttet", true)];
    render(<Personstatus status={status} erLitenSkjerm={false} />);
    expect(screen.queryByText(/Modal åpen/)).toBeNull();
    fireEvent.click(screen.getByText("Vis detaljer"));
    expect(screen.getByText(/Modal åpen aktive=1 historiske=1/)).toBeDefined();
  });

  it("rendrer liten skjerm-variant", () => {
    const status = [lagStatus("Bosatt", false)];
    render(<Personstatus status={status} erLitenSkjerm={true} />);
    expect(screen.getByText("Bosatt")).toBeDefined();
    expect(screen.getByText("Vis detaljer")).toBeDefined();
  });
});
