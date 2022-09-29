import React from "react";

import MKV from "../../../melosyskodeverk";

import { JournalforingForm } from "./journalforingform";
import SendForvaltningsMelding from "./sendForvaltningsMelding";
import Komponent from "./komponent";

const { BRUKER, VIRKSOMHET } = MKV.Koder.aktoersroller;

const { MEDLEMSKAP_LOVVALG, UNNTAK, TRYGDEAVGIFT } = MKV.Koder.sakstemaer;

const { FØRSTEGANG, SOEKNAD, SED, NY_VURDERING, HENVENDELSE, KLAGE, ANKE, ENDRET_PERIODE } =
  MKV.Koder.behandlinger.behandlingstyper;

describe("JournalforingForm", () => {
  let props = null;

  beforeEach(() => {
    props = {
      journalpostID: "1234",
      hoveddokumentID: "12345",
      vedlegg: [],
      hentOgVisAvsender: jest.fn(),
      hentOgVisBruker: jest.fn(),
      hentOgVisVirksomhet: jest.fn(),
      fagsakListe: [],
      hentOgVisRepresentant: jest.fn(),
      behandlingstemaer: [],
      formValues: {
        saksnummer: "-1",
        avsenderType: "",
        journalforingGjelder: BRUKER,
      },
      formErrors: {},
      settFeltInnhold: jest.fn(),
      settJournalforingHensikt: jest.fn(),
      submitFailed: false,
      avbrytJournalforing: jest.fn(),
      kanSubmittes: true,
      handleSubmit: jest.fn(),
      submitJournalforing: jest.fn(),
      submitSpinner: false,
      behandleAlleSakerToggleEnabled: true,
      landkoder: [],
    };
  });

  test("sending av forvaltningsmelding vises for sakstema MEDLEMSKAP_LOVVALG og behandlingstype FØRSTEGANG", () => {
    props.formValues.sakstema = MEDLEMSKAP_LOVVALG;
    props.formValues.opprettnysak_behandlingstype = FØRSTEGANG;
    const journalforingform = shallow(<JournalforingForm {...props} />);
    const komponenter = journalforingform.find(Komponent);
    const sendForvaltningsMelding = komponenter.get(1).props.innhold;

    expect(sendForvaltningsMelding.type).toBe(SendForvaltningsMelding);
  });

  each([UNNTAK, TRYGDEAVGIFT]).it(
    "sending av forvaltningsmelding vises IKKE for behandlingstema FØRSTEGANG og sakstema %s",
    (sakstema) => {
      props.formValues.sakstema = sakstema;
      props.formValues.opprettnysak_behandlingstema = FØRSTEGANG;

      const journalforingform = shallow(<JournalforingForm {...props} />);
      const sendForvaltningsMelding = journalforingform.find(SendForvaltningsMelding);
      expect(sendForvaltningsMelding).toHaveLength(0);
    }
  );

  each([SOEKNAD, SED, NY_VURDERING, HENVENDELSE, KLAGE, ANKE, ENDRET_PERIODE]).it(
    "sending av forvaltningsmelding vises IKKE for sakstema MEDLEMSKAP_LOVVALG og behandlingstema %s",
    (behandlingstema) => {
      props.formValues.sakstema = MEDLEMSKAP_LOVVALG;
      props.formValues.opprettnysak_behandlingstema = behandlingstema;

      const journalforingform = shallow(<JournalforingForm {...props} />);
      const sendForvaltningsMelding = journalforingform.find(SendForvaltningsMelding);
      expect(sendForvaltningsMelding).toHaveLength(0);
    }
  );

  test("sending av forvaltningsmelding vises ikke når man journalfører på virksomhet", () => {
    props.formValues.journalforingGjelder = VIRKSOMHET;

    const journalforingform = shallow(<JournalforingForm {...props} />);
    const sendForvaltningsMelding = journalforingform.find(SendForvaltningsMelding);
    expect(sendForvaltningsMelding).toHaveLength(0);
  });
});
