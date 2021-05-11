import React from "react";

import MKV from "../../../melosyskodeverk";

import { JournalforingForm } from "./journalforingform";
import SendForvaltningsMelding from "./sendForvaltningsMelding";

const {
  UTSENDT_ARBEIDSTAKER,
  UTSENDT_SELVSTENDIG,
  ARBEID_ETT_LAND_ØVRIG,
  IKKE_YRKESAKTIV,
  ARBEID_FLERE_LAND,
  ARBEID_NORGE_BOSATT_ANNET_LAND,
  ARBEID_I_UTLANDET,
} = MKV.Koder.behandlinger.behandlingstema;

describe("JournalforingForm", () => {
  let props = null;

  beforeEach(() => {
    props = {
      journalpostID: "1234",
      hoveddokumentID: "12345",
      vedlegg: [],
      hentOgVisAvsender: jest.fn(),
      hentOgVisBruker: jest.fn(),
      fagsakListe: [],
      hentOgVisRepresentant: jest.fn(),
      behandlingstemaer: [],
      formValues: {
        saksnummer: "-1",
        avsenderType: "",
      },
      settFeltInnhold: jest.fn(),
      settJournalforingHensikt: jest.fn(),
      avbrytJournalforing: jest.fn(),
      kanSubmittes: true,
      handleSubmit: jest.fn(),
      submitJournalforing: jest.fn(),
    };
  });

  each([
    UTSENDT_ARBEIDSTAKER,
    UTSENDT_SELVSTENDIG,
    ARBEID_ETT_LAND_ØVRIG,
    IKKE_YRKESAKTIV,
    ARBEID_FLERE_LAND,
    ARBEID_NORGE_BOSATT_ANNET_LAND,
    ARBEID_I_UTLANDET,
  ]).it("sending av forvaltningsmelding vises for behandlingstema %p", (behandlingstema) => {
    props.formValues.opprettnysak_behandlingstema = behandlingstema;
    const journalforingform = shallow(<JournalforingForm {...props} />);
    const sendForvaltningsMelding = journalforingform.find(SendForvaltningsMelding);

    expect(sendForvaltningsMelding).toHaveLength(1);
  });
});
