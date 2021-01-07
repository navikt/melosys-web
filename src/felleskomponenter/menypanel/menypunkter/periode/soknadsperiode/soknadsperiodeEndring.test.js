import React from "react";

import * as Nav from "../../../../../utils/navFrontend";

import Knapperad from "../../../../knapperad";

import SoknadsperiodeEndring from "./soknadsperiodeEndring";

describe("SoknadsperiodeEndring", () => {
  const lagProps = () => ({
    avbryt: jest.fn(),
    oppdaterPeriode: jest.fn(),
    soknadsperiodeNyFom: "11.12.2030",
    soknadsperiodeNyTom: "11.12.2035",
    vedFeltEndring: jest.fn(),
    vedFeltFokusUt: jest.fn(),
    erDatoerGyldig: true,
  });

  describe("fom inputfelt", () => {
    const props = lagProps();
    const soknadsperiodeEndring = shallow(<SoknadsperiodeEndring {...props} />);
    const fomInput = soknadsperiodeEndring.findWhere(
      (n) => n.type() === Nav.Input && n.props().label === "Fra og med:"
    );
    const fomInputProps = fomInput.props();

    it("vises", () => {
      expect(fomInput).toHaveLength(1);
      expect(fomInputProps.value).toBe(props.soknadsperiodeNyFom);
    });

    it("kaller vedFeltEndring ved change", () => {
      const event = { target: { value: "Verdi" } };
      fomInput.simulate("change", event);

      expect(props.vedFeltEndring).toHaveBeenCalledTimes(1);
      expect(props.vedFeltEndring).toHaveBeenLastCalledWith("soknadsperiodeNyFom", "Verdi");
    });

    it("kaller vedFeltFokusUt ved blur", () => {
      const event = { target: { value: "Verdi" } };
      fomInput.simulate("blur", event);

      expect(props.vedFeltFokusUt).toHaveBeenCalledTimes(1);
      expect(props.vedFeltFokusUt).toHaveBeenLastCalledWith("soknadsperiodeNyFom");
    });
  });

  describe("tom inputfelt", () => {
    const props = lagProps();
    const soknadsperiodeEndring = shallow(<SoknadsperiodeEndring {...props} />);
    const tomInput = soknadsperiodeEndring.findWhere(
      (n) => n.type() === Nav.Input && n.props().label === "Til og med:"
    );
    const tomInputProps = tomInput.props();

    it("vises", () => {
      expect(tomInput).toHaveLength(1);
      expect(tomInputProps.value).toBe(props.soknadsperiodeNyTom);
    });

    it("kaller vedFeltEndring ved change", () => {
      const event = { target: { value: "Verdi" } };
      tomInput.simulate("change", event);

      expect(props.vedFeltEndring).toHaveBeenCalledTimes(1);
      expect(props.vedFeltEndring).toHaveBeenLastCalledWith("soknadsperiodeNyTom", "Verdi");
    });

    it("kaller vedFeltFokusUt ved blur", () => {
      const event = { target: { value: "Verdi" } };
      tomInput.simulate("blur", event);

      expect(props.vedFeltFokusUt).toHaveBeenCalledTimes(1);
      expect(props.vedFeltFokusUt).toHaveBeenLastCalledWith("soknadsperiodeNyTom");
    });
  });

  describe("Knapperad", () => {
    const props = lagProps();
    const soknadsperiodeEndring = shallow(<SoknadsperiodeEndring {...props} />);
    const knappeRad = soknadsperiodeEndring.find(Knapperad);
    const knapperadProps = knappeRad.props();

    it("vises", () => {
      expect(knappeRad).toHaveLength(1);
    });

    it("får props for å oppdatere periode", () => {
      expect(knapperadProps.bekreft).toBe(props.oppdaterPeriode);
      expect(knapperadProps.bekreftRedigerbart).toBe(props.erDatoerGyldig);
    });

    it("får props for å avbryte endring av periode", () => {
      expect(knapperadProps.avbryt).toBe(props.avbryt);
    });
  });
});
