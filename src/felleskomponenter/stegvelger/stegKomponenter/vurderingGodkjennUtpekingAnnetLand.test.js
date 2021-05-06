import React from "react";

import * as Mui from "../../ui";
import * as Nav from "../../../utils/navFrontend";

import VurderingGodkjennUtpekingAnnetLand from "./vurderingGodkjennUtpekingAnnetLand";
import PdfLenkeListe from "../../../felleskomponenter/pdfLenkeListe";

describe("vurderingGodkjennUtpekingAnnetLand", () => {
  let props = null;

  beforeEach(() => {
    props = {
      lagreOgGodkjennUnntaksperioder: jest.fn(),
      redigerbart: true,
      overskrift: "Godkjenn utpeking",
      behandlingID: 4,
    };
  });

  it("trykk på knapp kaller lagreOgGodkjennUnntaksperioder", () => {
    const komponent = shallow(<VurderingGodkjennUtpekingAnnetLand {...props} />);

    const checkbox = komponent.find(Mui.Checkbox);
    const checkboxOnCheck = checkbox.props().onCheck;
    checkboxOnCheck({ checked: true });

    const fritekstfelt = komponent.find(Nav.Textarea);
    fritekstfelt.props().onChange({ target: { value: "Fritekst her" } });

    const hovedknapp = komponent.find(Mui.Knapp);
    hovedknapp.simulate("click");

    expect(props.lagreOgGodkjennUnntaksperioder).toHaveBeenCalledTimes(1);
    expect(props.lagreOgGodkjennUnntaksperioder).toHaveBeenLastCalledWith({
      varsleUtland: true,
      fritekst: "Fritekst her",
    });
  });

  it("viser overskrift", () => {
    const komponent = shallow(<VurderingGodkjennUtpekingAnnetLand {...props} />);

    const overskrift = komponent.find(Nav.Typo.Undertittel);

    expect(overskrift.children().text()).toBe(props.overskrift);
  });

  it("knapp er ikke disabled når redigerbar er true", () => {
    const komponent = shallow(<VurderingGodkjennUtpekingAnnetLand {...props} />);

    const hovedknapp = komponent.find(Mui.Knapp);

    expect(hovedknapp.props().disabled).toBe(false);
  });

  it("viser en pdflenkeliste", () => {
    const komponent = shallow(<VurderingGodkjennUtpekingAnnetLand {...props} />);

    const pdflenkeliste = komponent.find(PdfLenkeListe);

    expect(pdflenkeliste.props().behandlingID).toBe(props.behandlingID);
  });
});
