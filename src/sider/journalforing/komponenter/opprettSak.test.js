import React from "react";
import { OpprettSak } from "./opprettSak";
import * as Skjema from "../../../felleskomponenter/skjema";
import MultiSelect from "../../../felleskomponenter/skjema/input/multiselect";

import MKV from "../../../melosyskodeverk";

const { BRUKER, VIRKSOMHET } = MKV.Koder.aktoersroller;
const {
  UTSENDT_ARBEIDSTAKER,
  UTSENDT_SELVSTENDIG,
  ARBEID_ETT_LAND_ØVRIG,
  IKKE_YRKESAKTIV,
  ARBEID_FLERE_LAND,
  ARBEID_NORGE_BOSATT_ANNET_LAND,
  ARBEID_I_UTLANDET,
  YRKESAKTIV,
} = MKV.Koder.behandlinger.behandlingstema;

describe("OpprettSak", () => {
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
      sakstemaToggleEnabled: jest.fn(),
      journalforingSkjemaVerdier: {
        opprettnysak_behandlingstema: "",
        journalforingSoknadsland: "",
      },
    };
  });

  each([UTSENDT_SELVSTENDIG, ARBEID_ETT_LAND_ØVRIG, IKKE_YRKESAKTIV, ARBEID_NORGE_BOSATT_ANNET_LAND]).it(
    `Opprett Sak med fra/til dato`,
    (behandlingstema) => {
      props.journalforingSkjemaVerdier.opprettnysak_behandlingstema = behandlingstema;
      props.journalforingSkjemaVerdier.sakstype = MKV.Koder.sakstyper.EU_EOS;
      props.journalforingSkjemaVerdier.journalforingGjelder = MKV.Koder.aktoersroller.BRUKER;
      props.journalforingSkjemaVerdier.valgtBehandlingsTema = MKV.Koder.sakstyper.EU_EOS;

      props.journalforingSkjemaVerdier.journalforingSoknadsland = behandlingstema;
      const opprettSak = shallow(<OpprettSak {...props} />);

      const datovelger = opprettSak.find(Skjema.Datovelger);
      const radioKnapper = opprettSak.find(Skjema.Radio);
      const multiselect = opprettSak.find(MultiSelect);

      expect(datovelger).toHaveLength(2);
      expect(radioKnapper).toHaveLength(0);
      expect(multiselect).toHaveLength(1);
    }
  );

  each([ARBEID_I_UTLANDET, YRKESAKTIV]).it(`Opprett sak, skjulte tilvalg`, (behandlingstema) => {
    props.journalforingSkjemaVerdier.opprettnysak_behandlingstema = behandlingstema;
    props.journalforingSkjemaVerdier.journalforingSoknadsland = behandlingstema;

    const opprettSak = shallow(<OpprettSak {...props} />);
    const datovelger = opprettSak.find(Skjema.Datovelger);
    const radioKnapper = opprettSak.find(Skjema.Radio);
    const multiselect = opprettSak.find(MultiSelect);

    expect(datovelger).toHaveLength(0);
    expect(radioKnapper).toHaveLength(0);
    expect(multiselect).toHaveLength(0);
  });

  it(`Opprett sak fra/til dato, valg av land, radio knapper`, () => {
    props.journalforingSkjemaVerdier.opprettnysak_behandlingstema = ARBEID_FLERE_LAND;
    props.journalforingSkjemaVerdier.journalforingSoknadsland = ARBEID_FLERE_LAND;
    props.journalforingSkjemaVerdier.sakstype = MKV.Koder.sakstyper.EU_EOS;
    props.journalforingSkjemaVerdier.journalforingGjelder = MKV.Koder.aktoersroller.BRUKER;
    props.journalforingSkjemaVerdier.valgtBehandlingsTema = MKV.Koder.sakstyper.EU_EOS;

    const opprettSak = shallow(<OpprettSak {...props} />);
    const datovelger = opprettSak.find(Skjema.Datovelger);
    const radioKnapper = opprettSak.find(Skjema.Radio);
    const multiselect = opprettSak.find(MultiSelect);

    expect(datovelger).toHaveLength(2);
    expect(radioKnapper).toHaveLength(2);
    expect(multiselect).toHaveLength(1);
  });
});
