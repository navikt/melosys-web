import React from "react";

import MKV from "../../../melosyskodeverk";

import { JournalforingForm } from "./journalforingform";
import SendForvaltningsMelding from "./sendForvaltningsMelding";

const { BRUKER, VIRKSOMHET } = MKV.Koder.aktoersroller;
const {
  UTSENDT_ARBEIDSTAKER,
  UTSENDT_SELVSTENDIG,
  ARBEID_ETT_LAND_ØVRIG,
  ARBEID_TJENESTEPERSON_ELLER_FLY,
  ARBEID_KUN_NORGE,
  IKKE_YRKESAKTIV,
  ARBEID_FLERE_LAND,
  ARBEID_NORGE_BOSATT_ANNET_LAND,
  ARBEID_I_UTLANDET,
  YRKESAKTIV,
} = MKV.Koder.behandlinger.behandlingstema;

// TODO: Slett denne filen når vi tar av toggle på MELOSYS-5333

describe("JournalforingForm", () => {
  let props = null;

  beforeEach(() => {
    props = {
      behandleAlleSakerToggleEnabled: false,
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
    };
  });

  each([
    UTSENDT_ARBEIDSTAKER,
    UTSENDT_SELVSTENDIG,
    ARBEID_ETT_LAND_ØVRIG,
    ARBEID_TJENESTEPERSON_ELLER_FLY,
    ARBEID_KUN_NORGE,
    IKKE_YRKESAKTIV,
    ARBEID_FLERE_LAND,
    ARBEID_NORGE_BOSATT_ANNET_LAND,
    ARBEID_I_UTLANDET,
    YRKESAKTIV,
  ]).it("sending av forvaltningsmelding vises for behandlingstema %p", (behandlingstema) => {
    props.formValues.opprettnysak_behandlingstema = behandlingstema;
    const journalforingform = shallow(<JournalforingForm {...props} />);
    const sendForvaltningsMelding = journalforingform.find(SendForvaltningsMelding);

    expect(sendForvaltningsMelding).toHaveLength(1);
  });

  test("sending av forvaltningsmelding vises ikke når man journalfører på virksomhet", () => {
    props.formValues.journalforingGjelder = VIRKSOMHET;
    const journalforingform = shallow(<JournalforingForm {...props} />);
    const sendForvaltningsMelding = journalforingform.find(SendForvaltningsMelding);

    expect(sendForvaltningsMelding).toHaveLength(0);
  });
});
