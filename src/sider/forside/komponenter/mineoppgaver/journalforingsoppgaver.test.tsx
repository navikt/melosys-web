import React from "react";
import { shallow } from "enzyme";
import SorterbarListe from "../../../../felleskomponenter/sorterbarListe";
import JournalforingOppgave from "../../../../felleskomponenter/oppgaveliste/journalforingOppgave";
import { JournalforingsOppgaver } from "./jornualforingoppgaver";
import * as Nav from "../../../../navFrontend";

describe("Journalføringsoppgaver", () => {
  const journalforing = [
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
  ];

  const props = {
    mineSaker: {
      journalforing,
    },
    landkoder: [],
  };

  it("viser en OppgaverMedSortering for journalføringsoppgaver", () => {
    // @ts-ignore
    const mineSaker = shallow(<JournalforingsOppgaver {...props} />);
    const journalforingsOppgaver = mineSaker.find(SorterbarListe).first();

    const journalforingOppgaverProps = journalforingsOppgaver.props();
    expect(journalforingOppgaverProps.component).toBe(JournalforingOppgave);
    expect(journalforingOppgaverProps.elementer).toBe(props.mineSaker.journalforing);
  });

  it("viser en melding dersom det ikke er noen journalføringsoppgaver eller behandlinger", () => {
    props.mineSaker = {
      journalforing: [],
    };

    // @ts-ignore
    const mineSaker = shallow(<JournalforingsOppgaver {...props} />);
    const info = mineSaker.find(Nav.AlertStripeInfo);
    expect(info).toHaveLength(1);
  });
});
