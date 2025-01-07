import { JournalforingsOppgaver } from "./jornualforingoppgaver";
import { renderWithProviders } from "../../../../ducks/test-utils/renderWithProviders";
import { screen, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

describe("Journalføringsoppgaver", () => {
  const journalforing = [
    {
      aktivTil: "2019-01-01",
      ansvarligID: "Z991111",
      fnr: "28106600300",
      journalpostID: "DOK_3789",
      oppgaveID: "174464932",
      prioritet: "HOY",
      sammensattNavn: "KAKE ARTIG",
      versjon: 1,
      navn: "Navn 1",
    },
    {
      aktivTil: "2016-01-01",
      ansvarligID: "Z992222",
      fnr: "28106600300",
      journalpostID: "DOK_3789",
      oppgaveID: "174464932",
      prioritet: "HOY",
      sammensattNavn: "KAKE ARTIG",
      versjon: 1,
      navn: "Navn 2",
    },
  ];

  const props = {
    mineSaker: {
      journalforing,
    },
    landkoder: [],
    dispatch: vi.fn(),
  };

  it("viser journalføringsoppgavene sortert etter aktivTil", () => {
    renderWithProviders(
      // Trenger en Router på toppnivå her siden vi bruker Link lengre ned.
      <MemoryRouter>
        <JournalforingsOppgaver {...props} />
      </MemoryRouter>,
    );

    const linker = screen.queryAllByRole("link");
    expect(linker).toHaveLength(2);
    expect(within(linker[0]).getByText("Navn 2")).toBeInTheDocument();
    expect(within(linker[1]).getByText("Navn 1")).toBeInTheDocument();
  });

  it("viser en melding dersom det ikke er noen journalføringsoppgaver", () => {
    props.mineSaker = {
      journalforing: [],
    };

    renderWithProviders(<JournalforingsOppgaver {...props} />);

    expect(screen.getByText("Det er ingen journalføringsoppgaver på arbeidsbenken din")).toBeInTheDocument();
  });
});
