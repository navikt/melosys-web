import { describe, it, expect, beforeEach } from "vitest";
import { within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import React from "react";

import SorterbarListe from "./sorterbarListe";
import JournalforingOppgave from "../oppgaveliste/journalforingOppgave";
import { renderWithProviders } from "../../ducks/test-utils/renderWithProviders";
import { reduxForm } from "redux-form";
import { BrowserRouter as Router } from "react-router-dom";

describe("SorterbarListe", () => {
  let props: any;
  const WrappedSorterbarListe = reduxForm({ form: "test" })(SorterbarListe as any);

  beforeEach(() => {
    props = {
      component: JournalforingOppgave,
      defaultChecked: "descending",
      sortingLegend: "Sorter journalføringsoppgaver etter frist:",
      sortingPath: "aktivTil",
      elementer: [
        {
          aktivTil: "2016-02-21",
          ansvarligID: "Z991111",
          fnr: "28106600300",
          journalpostID: "DOK_3789",
          oppgaveID: "174464932",
          prioritet: "HOY",
          sammensattNavn: "KAKE ARTIG",
          versjon: 1,
        },
        {
          aktivTil: "2016-02-20",
          ansvarligID: "Z992222",
          fnr: "28106600300",
          journalpostID: "DOK_3789",
          oppgaveID: "174464932",
          prioritet: "HOY",
          sammensattNavn: "KAKE ARTIG",
          versjon: 1,
        },
        {
          aktivTil: "2016-02-22",
          ansvarligID: "Z993333",
          fnr: "28106600300",
          journalpostID: "DOK_3789",
          oppgaveID: "174464932",
          prioritet: "HOY",
          sammensattNavn: "KAKE ARTIG",
          versjon: 1,
        },
      ],
    };
  });

  it("kan sortere slik at nyeste element kommer først", async () => {
    props.defaultChecked = "ascending";
    const { findByLabelText, findAllByRole } = renderWithProviders(
      <Router>
        <WrappedSorterbarListe {...props} />
      </Router>,
    );
    const user = userEvent.setup();
    await user.click(await findByLabelText("Nyeste først"));

    const links = await findAllByRole("link");
    expect(links).toHaveLength(3);
    expect(within(links[0]).getByText("2016-02-22")).toBeInTheDocument();
    expect(within(links[2]).getByText("2016-02-20")).toBeInTheDocument();
  });

  it("kan sortere slik at eldste element kommer først", async () => {
    const { findByLabelText, findAllByRole } = renderWithProviders(
      <Router>
        <WrappedSorterbarListe {...props} />
      </Router>,
    );
    const user = userEvent.setup();
    await user.click(await findByLabelText("Eldste først"));

    const links = await findAllByRole("link");
    expect(links).toHaveLength(3);
    expect(within(links[0]).getByText("2016-02-20")).toBeInTheDocument();
    expect(within(links[2]).getByText("2016-02-22")).toBeInTheDocument();
  });

  it("viser ingenting hvis elementer er falsy", () => {
    props.elementer = null;
    const { container } = renderWithProviders(
      <Router>
        <WrappedSorterbarListe {...props} />
      </Router>,
    );

    expect(container).toBeEmptyDOMElement();
  });

  it("viser ikke sortering hvis bare ett element", () => {
    props.elementer = [{}];
    const { queryByLabelText } = renderWithProviders(
      <Router>
        <WrappedSorterbarListe {...props} />
      </Router>,
    );

    expect(queryByLabelText("Nyeste først")).not.toBeInTheDocument();
    expect(queryByLabelText("Eldste først")).not.toBeInTheDocument();
  });
});
