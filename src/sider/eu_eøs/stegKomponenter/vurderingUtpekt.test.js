import React from "react";

import * as Skjema from "../../../felleskomponenter/skjema";

import MKV from "../../../melosyskodeverk";

import RegisterKontrollTreff from "../../../felleskomponenter/registerkontrollTreff";
import { VurderingUtpekt } from "./vurderingUtpekt";

describe("VurderingUtpekt", () => {
  let props = null;

  beforeEach(() => {
    props = {
      vurderingBegrunnelser: ["Begrunnelse"],
      slettData: jest.fn(),
      bekreftOgFortsett: jest.fn(),
      tilbake: jest.fn(),
      redigerbart: true,
      tilstand: {
        harAvklaring: true,
        lovvalgsbestemmelse: "Lovvalgsbestemmelse",
      },
      oppdaterData: jest.fn(),
      handleSubmit: jest.fn(),
      formValues: {},
      lovvalgsperiode: { fom: "", tom: "" },
      behandlingstema: MKV.Koder.behandlinger.behandlingstema.BESLUTNING_LOVVALG_NORGE,
      behandlingID: 1,
      endreFelt: jest.fn(),
    };
  });

  it("viser advarsler fra kontroller", () => {
    const vurderingUtpekt = shallow(<VurderingUtpekt {...props} />);
    const registerKontrollTreff = vurderingUtpekt.find(RegisterKontrollTreff);

    expect(registerKontrollTreff).toHaveLength(1);
    expect(registerKontrollTreff.props().vurderingBegrunnelser).toEqual(props.vurderingBegrunnelser);
  });

  it("viser artikkelen Norge er utpekt etter", () => {
    const vurderingUtpekt = shallow(<VurderingUtpekt {...props} />);
    const select = vurderingUtpekt.find(Skjema.Select);

    expect(select).toHaveLength(1);
  });

  it("viser lovvalgsperioden Norge er utpekt for", () => {
    const vurderingUtpekt = shallow(<VurderingUtpekt {...props} />);
    const datovelgere = vurderingUtpekt.find(Skjema.Datovelger);

    expect(datovelgere).toHaveLength(2);
  });

  it("viser radiobuttons for godkjenning og avslag", () => {
    props.tilstand.utpekingGodkjent = true;
    const vurderingUtpekt = shallow(<VurderingUtpekt {...props} />);
    const radios = vurderingUtpekt.find(Skjema.Radio);

    expect(radios).toHaveLength(2);
  });

  it("viser en form som tar handleSubmit som onSubmit-prop", () => {
    const vurderingAvslaaUtpeking = shallow(<VurderingUtpekt {...props} />);
    const form = vurderingAvslaaUtpeking.find("form");

    expect(form.props().onSubmit).toBe(props.handleSubmit);
  });
});
