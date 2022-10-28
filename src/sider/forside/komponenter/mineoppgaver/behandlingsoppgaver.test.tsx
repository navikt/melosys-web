import React from "react";
import { shallow } from "enzyme";
import * as redux from "react-redux";
import SorterbarListe from "../../../../felleskomponenter/sorterbarListe";
import { BehandlingOppgaver } from "./behandlingOppgaver";
import BehandlingOppgave from "../../../../felleskomponenter/oppgaveliste/behandlingOppgave";

describe("Behandlingsoppgaver", () => {
  const saksbehandling = [
    {
      oppgaveID: "174562068",
      sammensattNavn: "GLITRENDE HATT",
      fnr: "28106600300",
      saksnummer: "4",
      sakstype: {
        kode: "TRYGDEAVTALE",
        term: "Avtaleland",
      },
      behandling: {
        behandlingID: 4,
        behandlingstype: {
          kode: "SOEKNAD",
          term: "Søknad",
        },
        behandlingsstatus: {
          kode: "UBEH",
          term: "Under behandling",
        },
        endretDato: "2018-08-10T15:00:00.622Z",
        erUnderOppdatering: false,
        registrertDato: "2018-12-11T16:30:00.622Z",
        svarFrist: "2019-12-11T16:30:00.622Z",
      },
      aktivTil: "2018-01-28",
      periode: {
        fom: "2018-10-01",
        tom: "2019-08-31",
      },
      prioritet: "HOY",
      land: {
        landkoder: ["NO"],
        erUkjenteEllerAlleEosLand: true,
      },
      versjon: 1,
      ansvarligID: "Z991001",
    },
  ];

  const props = {
    mineSaker: {
      saksbehandling,
    },
    landkoder: [],
  };

  it("viser en OppgaverMedSortering for journalføringsoppgaver", () => {
    const useDispatchSpy = jest.spyOn(redux, "useDispatch");
    const mockDispatchFn = jest.fn();
    useDispatchSpy.mockReturnValue(mockDispatchFn);

    // @ts-ignore
    const saksbehandlingsOppgaver = shallow(<BehandlingOppgaver dispatch={mockDispatchFn} {...props} />);
    const behandlingsOppgaver = saksbehandlingsOppgaver.find(SorterbarListe).first();

    const journalforingOppgaverProps = behandlingsOppgaver.props();
    expect(journalforingOppgaverProps.component).toBe(BehandlingOppgave);
    expect(journalforingOppgaverProps.elementer).toBe(props.mineSaker.saksbehandling);

    useDispatchSpy.mockClear();
  });
});
