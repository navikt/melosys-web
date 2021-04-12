import React from "react";

import * as Nav from "../../../utils/navFrontend";
import * as Skjema from "../index";

import PeriodeForkorter from "./index";

describe("PeriodeForkorter", () => {
  let props = null;

  beforeEach(() => {
    props = {
      checkboxClassName: "classname",
      redigerbart: true,
      checkboxFeltnavn: "forkortlovvalgsperiode",
      forkortPeriode: true,
      checkboxLabel: "Forkort lovvalgsperiode",
      onUncheck: jest.fn(),
      fomLabel: "Fra og med",
      fomFeltNavn: "fom",
      tomLabel: "Til og med",
      tomFeltNavn: "tom",
      fomRedigerbar: true,
    };
  });

  it("viser en Nav.Row for checkbox", () => {
    const periodeForkorter = shallow(<PeriodeForkorter {...props} />);
    const row = periodeForkorter.findWhere(
      (n) => n.type() === Nav.Row && n.props().className === props.checkboxClassName
    );

    expect(row).toHaveLength(1);
  });

  it("viser en checkbox", () => {
    const periodeForkorter = shallow(<PeriodeForkorter {...props} />);
    const checkbox = periodeForkorter.find(Skjema.Checkbox);
    const checkboxProps = checkbox.props();

    expect(checkbox).toHaveLength(1);
    expect(checkboxProps.feltNavn).toBe(props.checkboxFeltnavn);
    expect(checkboxProps.label).toBe(props.checkboxLabel);
    expect(checkboxProps.disabled).toBe(!props.redigerbart);
  });

  //TODO: Fjern skip etter featuretoggle melosys.input.DATOFELT er fjernet
  it.skip("viser felter for å forkorte periode dersom forkortPeriode prop er true", () => {
    const periodeForkorter = shallow(<PeriodeForkorter {...props} />);
    const datovelgere = periodeForkorter.find(Skjema.Datovelger);
    const datovelgerFomProps = datovelgere.first().props();
    const datovelgerTomProps = datovelgere.last().props();

    expect(datovelgere).toHaveLength(2);
    expect(datovelgerFomProps.label).toBe(props.fomLabel);
    expect(datovelgerFomProps.feltNavn).toBe(props.fomFeltNavn);
    expect(datovelgerFomProps.disabled).toBe(!props.redigerbart);
    expect(datovelgerTomProps.label).toBe(props.tomLabel);
    expect(datovelgerTomProps.feltNavn).toBe(props.tomFeltNavn);
    expect(datovelgerTomProps.disabled).toBe(!props.redigerbart);
  });

  it("viser ikke felter for å forkorte periode dersom forkortPeriode prop er false", () => {
    props.forkortPeriode = false;

    const periodeForkorter = shallow(<PeriodeForkorter {...props} />);

    expect(periodeForkorter.find(Skjema.Datovelger)).toHaveLength(0);
  });

  it("kaller onUncheck når checkbox blir unchecked", () => {
    const periodeForkorter = shallow(<PeriodeForkorter {...props} />);
    const checkbox = periodeForkorter.find(Skjema.Checkbox);

    const checkedEvent = { currentTarget: { checked: true } };
    checkbox.simulate("click", checkedEvent);
    expect(props.onUncheck).toHaveBeenCalledTimes(0);

    const unCheckedEvent = { currentTarget: { checked: false } };
    checkbox.simulate("click", unCheckedEvent);
    expect(props.onUncheck).toHaveBeenCalledTimes(1);
  });

  //TODO: Fjern skip etter featuretoggle melosys.input.DATOFELT er fjernet
  it.skip("fomRedigerbar kan disable fom", () => {
    props.fomRedigerbar = false;
    const periodeForkorter = shallow(<PeriodeForkorter {...props} />);

    const fomDatovelger = periodeForkorter.find(Skjema.Datovelger).findWhere((n) => n.props().label === props.fomLabel);

    expect(fomDatovelger.props().disabled).toBe(true);
  });
});
