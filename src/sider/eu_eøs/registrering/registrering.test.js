import React from "react";

import { Registrering } from "./registrering";
import SideOppsummering from "../../../felleskomponenter/oppsummering/sideOppsummering";

import MKV from "../../../melosyskodeverk";

const { REGISTRERING_UNNTAK_NORSK_TRYGD_UTSTASJONERING, REGISTRERING_UNNTAK_NORSK_TRYGD_ØVRIGE } =
  MKV.Koder.behandlinger.behandlingstema;

const { AVSLUTTET, MIDLERTIDIG_LOVVALGSBESLUTNING, UNDER_BEHANDLING } = MKV.Koder.behandlinger.behandlingsstatus;

describe("Registrering", () => {
  let props = null;

  beforeEach(() => {
    props = {
      Saksopplysninger: () => <span />,
      hentAvklartefakta: jest.fn(),
      hentBehandling: jest.fn(),
      hentFagsaker: jest.fn(),
      hentLovvalgsperioder: jest.fn(),
      resetFagsakState: jest.fn(),
      tilbakeleggOppgave: jest.fn(),
      redigerbart: true,
      avklartefakta: [],
      vurderingBegrunnelser: [],
      fagsak: {},
      lovvalgsperioder: [], // TODO lag proptype
      oppsummering: {},
      person: {},
      sed: {},
      match: {
        params: { snr: "" },
      },
      location: {},
      behandlingstema: "",
      behandlingsstatus: "",
      lovvalgsperiodeFom: "",
      lovvalgsperiodeTom: "PT.string",
      tilForsiden: jest.fn(),
      lovvalgsland: {},
      visOppfriskModal: jest.fn(),
      behandlingOppfriskes: false,
      dokumentOversikt: [],
      dokumenter: [],
      startOgVisOppfriskModal: jest.fn(),
      visRevurderFagsakDialogHandle: jest.fn(),
    };
  });

  it(`Revurder fagsak vises ikke dersom behandlingsstatus er ${UNDER_BEHANDLING}`, () => {
    props.behandlingsstatus = UNDER_BEHANDLING;
    const registrering = shallow(<Registrering {...props} />);

    const sideOppsummering = registrering.find(SideOppsummering);
    const behandlingsmeny = sideOppsummering.props().renderBehandlingsmeny();
    expect(behandlingsmeny.props.visRevurderFagsak).toBe(false);
  });

  it(`Revurder fagsak vises dersom behandlingsstatus er ${AVSLUTTET} og behandlingstema er ${REGISTRERING_UNNTAK_NORSK_TRYGD_UTSTASJONERING}`, () => {
    props.behandlingsstatus = AVSLUTTET;
    props.behandlingstema = REGISTRERING_UNNTAK_NORSK_TRYGD_UTSTASJONERING;

    const registrering = shallow(<Registrering {...props} />);

    const sideOppsummering = registrering.find(SideOppsummering);
    const behandlingsmeny = sideOppsummering.props().renderBehandlingsmeny();
    expect(behandlingsmeny.props.visRevurderFagsak).toBe(true);
  });

  it(`Revurder fagsak vises dersom behandlingsstatus er ${MIDLERTIDIG_LOVVALGSBESLUTNING} og behandlingstema er ${REGISTRERING_UNNTAK_NORSK_TRYGD_UTSTASJONERING}`, () => {
    props.behandlingsstatus = MIDLERTIDIG_LOVVALGSBESLUTNING;
    props.behandlingstema = REGISTRERING_UNNTAK_NORSK_TRYGD_UTSTASJONERING;

    const registrering = shallow(<Registrering {...props} />);

    const sideOppsummering = registrering.find(SideOppsummering);
    const behandlingsmeny = sideOppsummering.props().renderBehandlingsmeny();
    expect(behandlingsmeny.props.visRevurderFagsak).toBe(true);
  });

  it(`Revurder fagsak vises dersom behandlingsstatus er ${AVSLUTTET} og behandlingstema er ${REGISTRERING_UNNTAK_NORSK_TRYGD_ØVRIGE}`, () => {
    props.behandlingsstatus = AVSLUTTET;
    props.behandlingstema = REGISTRERING_UNNTAK_NORSK_TRYGD_ØVRIGE;

    const registrering = shallow(<Registrering {...props} />);

    const sideOppsummering = registrering.find(SideOppsummering);
    const behandlingsmeny = sideOppsummering.props().renderBehandlingsmeny();
    expect(behandlingsmeny.props.visRevurderFagsak).toBe(true);
  });

  it(`Revurder fagsak vises dersom behandlingsstatus er ${MIDLERTIDIG_LOVVALGSBESLUTNING} og behandlingstema er ${REGISTRERING_UNNTAK_NORSK_TRYGD_ØVRIGE}`, () => {
    props.behandlingsstatus = MIDLERTIDIG_LOVVALGSBESLUTNING;
    props.behandlingstema = REGISTRERING_UNNTAK_NORSK_TRYGD_ØVRIGE;

    const registrering = shallow(<Registrering {...props} />);

    const sideOppsummering = registrering.find(SideOppsummering);
    const behandlingsmeny = sideOppsummering.props().renderBehandlingsmeny();
    expect(behandlingsmeny.props.visRevurderFagsak).toBe(true);
  });
});
