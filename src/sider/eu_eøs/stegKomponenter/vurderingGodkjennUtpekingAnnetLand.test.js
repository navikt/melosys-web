import React from "react";

import * as Mui from "../../ui";
import * as Nav from "../../../utils/navFrontend";

import MKV from "../../../melosyskodeverk";

import { VurderingGodkjennUtpekingAnnetLand } from "./vurderingGodkjennUtpekingAnnetLand";
import PdfLenkeListe from "../../../felleskomponenter/pdfLenkeListe";

describe("vurderingGodkjennUtpekingAnnetLand", () => {
  let props = null;

  beforeEach(() => {
    props = {
      lagreOgGodkjennUnntaksperioder: jest.fn(),
      redigerbart: true,
      overskrift: "Godkjenn utpeking",
      behandlingID: 4,
      vurderUtpekingFormValues: {
        fom: "12.12.2020",
        tom: "12.12.2021",
        lovvalgsbestemmelse: MKV.Koder.lovvalgsbestemmelser.lovvalgbestemmelser_883_2004.FO_883_2004_ART12_1,
      },
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
    hovedknapp.props().onClick();

    expect(props.lagreOgGodkjennUnntaksperioder).toHaveBeenCalledTimes(1);
    expect(props.lagreOgGodkjennUnntaksperioder).toHaveBeenLastCalledWith({
      varsleUtland: true,
      fritekst: "Fritekst her",
      endretPeriode: {
        fom: "2020-12-12",
        tom: "2021-12-12",
      },
      lovvalgsbestemmelse: MKV.Koder.lovvalgsbestemmelser.lovvalgbestemmelser_883_2004.FO_883_2004_ART12_1,
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
