import React from "react";

import Knapperad from "../../../../knapperad";

import SoknadsperiodeEndring from "./soknadsperiodeEndring";

describe("SoknadsperiodeEndring", () => {
  const lagProps = () => ({
    avbryt: jest.fn(),
    lagre: jest.fn(),
    soknadsperiodeFom: "11.12.2030",
    soknadsperiodeTom: "11.12.2035",
    soknadsperiodeFomErrors: undefined,
    soknadsperiodeTomErrors: undefined,
    vedFeltEndring: jest.fn(),
  });

  // TODO: Fjern kommentar etter featuretoggle melosys.input.DATOFELT er fjernet. (Skip funket ikke for some reason)
  /* describe("fom inputfelt", () => {
    const props = lagProps();
    const soknadsperiodeEndring = shallow(<SoknadsperiodeEndring {...props} />);
    const fomInput = soknadsperiodeEndring.findWhere(
      (n) => n.type() === Datovelger && n.props().label === "Fra og med:"
    );
    const fomInputProps = fomInput.props();

    it("vises", () => {
      expect(fomInput).toHaveLength(1);
      expect(fomInputProps.value).toStrictEqual(Utils.dato.norskStringTilDate(props.soknadsperiodeFom));
    });

    it("kaller vedFeltEndring ved change", () => {
      const nyDato = "01.01.2011"
      fomInput.simulate("change", Utils.dato.norskStringTilDate(nyDato));

      expect(props.vedFeltEndring).toHaveBeenCalledTimes(1);
      expect(props.vedFeltEndring).toHaveBeenLastCalledWith("soknadsperiodeFom", nyDato);
    });
  });

  describe("tom inputfelt", () => {
    const props = lagProps();
    const soknadsperiodeEndring = shallow(<SoknadsperiodeEndring {...props} />);
    const tomInput = soknadsperiodeEndring.findWhere(
      (n) => n.type() === Datovelger && n.props().label === "Til og med:"
    );
    const tomInputProps = tomInput.props();

    it("vises", () => {
      expect(tomInput).toHaveLength(1);
      expect(tomInputProps.value).toStrictEqual(Utils.dato.norskStringTilDate(props.soknadsperiodeTom));
    });

    it("kaller vedFeltEndring ved change", () => {
      const nyDato = "02.02.2012"
      tomInput.simulate("change", Utils.dato.norskStringTilDate(nyDato));

      expect(props.vedFeltEndring).toHaveBeenCalledTimes(1);
      expect(props.vedFeltEndring).toHaveBeenLastCalledWith("soknadsperiodeTom", nyDato);
    });
  }); */

  describe("Knapperad", () => {
    const props = lagProps();
    const soknadsperiodeEndring = shallow(<SoknadsperiodeEndring {...props} />);
    const knappeRad = soknadsperiodeEndring.find(Knapperad);
    const knapperadProps = knappeRad.props();

    it("vises", () => {
      expect(knappeRad).toHaveLength(1);
    });

    it("får props for å lagre periode", () => {
      expect(knapperadProps.bekreft).toBe(props.lagre);
    });

    it("får props for å avbryte endring av periode", () => {
      expect(knapperadProps.avbryt).toBe(props.avbryt);
    });
  });

  describe("Lagreknapp", () => {
    it("kan trykkes på", () => {
      const props = lagProps();
      const soknadsperiodeEndring = shallow(<SoknadsperiodeEndring {...props} />);
      const knappeRad = soknadsperiodeEndring.find(Knapperad);
      const knapperadProps = knappeRad.props();

      expect(knapperadProps.bekreftRedigerbart).toBe(true);
    });

    it("kan ikke trykkes på når fom har errors", () => {
      const props = lagProps();
      props.soknadsperiodeFomErrors = "Feil skjedde";
      const soknadsperiodeEndring = shallow(<SoknadsperiodeEndring {...props} />);
      const knappeRad = soknadsperiodeEndring.find(Knapperad);
      const knapperadProps = knappeRad.props();

      expect(knapperadProps.bekreftRedigerbart).toBe(false);
    });

    it("kan ikke trykkes på når tom har errors", () => {
      const props = lagProps();
      props.soknadsperiodeTomErrors = "Feil skjedde";
      const soknadsperiodeEndring = shallow(<SoknadsperiodeEndring {...props} />);
      const knappeRad = soknadsperiodeEndring.find(Knapperad);
      const knapperadProps = knappeRad.props();

      expect(knapperadProps.bekreftRedigerbart).toBe(false);
    });
  });
});
