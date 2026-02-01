import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";

vi.mock("../../../../navFrontend", () => ({
  Alert: ({ children }: any) => <div>{children}</div>,
}));

vi.mock("../../../../felleskomponenter/oppgaveliste/journalforingOppgave", () => ({
  default: () => <div>oppgave</div>,
}));

vi.mock("../../../../felleskomponenter/sorterbarListe", () => ({
  default: ({ elementer, component: Component }: any) => (
    <div>
      {elementer?.map((_: any, i: number) => (
        <Component key={i} />
      ))}
    </div>
  ),
}));

import { JournalforingsOppgaver } from "./jornualforingoppgaver";

describe("JournalforingsOppgaver", () => {
  it("viser info-melding når ingen journalføringsoppgaver", () => {
    render(<JournalforingsOppgaver mineSaker={{ journalforing: [] }} />);
    expect(screen.getByText("Det er ingen journalføringsoppgaver på arbeidsbenken din")).toBeDefined();
  });

  it("rendrer oppgaver via SorterbarListe", () => {
    render(<JournalforingsOppgaver mineSaker={{ journalforing: [{ id: 1 }, { id: 2 }] }} />);
    expect(screen.getAllByText("oppgave")).toHaveLength(2);
  });

  it("viser ikke info-melding når det finnes oppgaver", () => {
    render(<JournalforingsOppgaver mineSaker={{ journalforing: [{ id: 1 }] }} />);
    expect(screen.queryByText("Det er ingen journalføringsoppgaver på arbeidsbenken din")).toBeNull();
  });
});
