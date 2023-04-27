import React from "react";

import { VurderingEndrePeriode } from "./vurderingEndrePeriode";
import { lagAvklartfakta } from "../../../felleskomponenter/stegvelger";
import Datovelger from "../../../felleskomponenter/datovelger";

describe("vurderingEndrePeriode", () => {
  let props = null;

  beforeEach(() => {
    fetch.resetMocks();
    fetch.mockResponse(JSON.stringify({}));

    props = {
      behandlingID: 1,
      lovvalgsPeriode: {},
      endreLovvalgsperioderHandler: jest.fn(),
      endreVedtak: jest.fn(),
      tilForsiden: jest.fn(),
      tilbake: jest.fn(),
      redigerbart: true,
      tilstand: {
        aarsakEndringPeriodeAvklartfakta: lagAvklartfakta("a", "b", "c", [], "fritekst"),
      },
      oppdaterData: jest.fn(),
      oppdaterPeriode: jest.fn(),
      slettData: jest.fn(),
      soknadsland: ["SE"],
    };
  });

  it("viser en pdfLenkeListe", () => {
    const component = shallow(<VurderingEndrePeriode {...props} />);
    expect(component.find("PdfLenkeListe")).toHaveLength(1);
  });

  it("viser StegKnapper", () => {
    const component = shallow(<VurderingEndrePeriode {...props} />);
    expect(component.find("StegKnapper")).toHaveLength(1);
  });

  describe("Bekreftelseknappen", () => {
    it("endrer periode når den trykkes", () => {
      const component = shallow(<VurderingEndrePeriode {...props} />);
      const stegKnapper = component.find("StegKnapper");
      component.instance().validerAlt = jest.fn(() => true);
      stegKnapper.props().bekreftKnappProps.onClick();
      expect(props.oppdaterPeriode).toHaveBeenCalled();
      expect(props.endreLovvalgsperioderHandler).toHaveBeenCalled();
    });
  });

  it("viser to datofelt for fradato og tildato", () => {
    const component = shallow(<VurderingEndrePeriode {...props} />);
    expect(component.find(Datovelger)).toHaveLength(2);
  });
});
