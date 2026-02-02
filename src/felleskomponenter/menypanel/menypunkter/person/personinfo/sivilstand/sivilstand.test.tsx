import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";

vi.mock("../../../../../../navFrontend", () => ({
  Column: ({ children }: any) => <div>{children}</div>,
  BodyLong: ({ children }: any) => <span>{children}</span>,
}));

vi.mock("../../../../../ui", () => ({
  Lenkeknapp: ({ children, onClick }: any) => <button onClick={onClick}>{children}</button>,
}));

vi.mock("./sivilstandModal", () => ({
  default: ({ skalViseModal, aktiveSivilstander, historiskeSivilstander }: any) =>
    skalViseModal ? (
      <div>
        Modal åpen aktive={aktiveSivilstander.length} historiske={historiskeSivilstander.length}
      </div>
    ) : null,
}));

import Sivilstand from "./sivilstand";

const lagSivilstand = (type: string, erHistorisk: boolean) => ({
  type,
  relatertVedSivilstand: null,
  gyldigFraOgMed: "2024-01-01",
  bekreftelsesdato: null,
  master: "FREG",
  kilde: "kilde",
  erHistorisk,
});

describe("Sivilstand", () => {
  it("rendrer ingenting når sivilstand er undefined", () => {
    render(<Sivilstand sivilstand={undefined} erLitenSkjerm={false} />);
    expect(screen.queryByText("Vis detaljer")).toBeNull();
  });

  it("viser aktiv sivilstand type", () => {
    const sivilstand = [lagSivilstand("Gift", false)];
    render(<Sivilstand sivilstand={sivilstand} erLitenSkjerm={false} />);
    expect(screen.getByText("Gift")).toBeDefined();
    expect(screen.getByText("Sivilstand:")).toBeDefined();
  });

  it("viser fallback når ingen aktive sivilstander", () => {
    const sivilstand = [lagSivilstand("Skilt", true)];
    render(<Sivilstand sivilstand={sivilstand} erLitenSkjerm={false} />);
    expect(screen.getByText("Ingen sivilstand funnet")).toBeDefined();
  });

  it("åpner modal ved klikk på Vis detaljer", () => {
    const sivilstand = [lagSivilstand("Gift", false), lagSivilstand("Ugift", true)];
    render(<Sivilstand sivilstand={sivilstand} erLitenSkjerm={false} />);
    expect(screen.queryByText(/Modal åpen/)).toBeNull();
    fireEvent.click(screen.getByText("Vis detaljer"));
    expect(screen.getByText(/Modal åpen aktive=1 historiske=1/)).toBeDefined();
  });

  it("rendrer liten skjerm-variant", () => {
    const sivilstand = [lagSivilstand("Gift", false)];
    render(<Sivilstand sivilstand={sivilstand} erLitenSkjerm={true} />);
    expect(screen.getByText("Gift")).toBeDefined();
    expect(screen.getByText("Vis detaljer")).toBeDefined();
  });
});
