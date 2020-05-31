import React from 'react';

import * as Nav from '../../../utils/navFrontend';
import * as Skjema from '../index';

import PeriodeForkorter from './index';

describe('PeriodeForkorter', () => {
  let props = null;

  beforeEach(() => {
    props = {
      checkboxClassName: 'classname',
      redigerbart: true,
      checkboxFeltnavn: 'forkortlovvalgsperiode',
      forkortPeriode: true,
      checkboxLabel: 'Forkort lovvalgsperiode',
      onUncheck: jest.fn(),
      fomLabel: 'Fra og med',
      fomFeltNavn: 'fom',
      tomLabel: 'Til og med',
      tomFeltNavn: 'tom',
    };
  });

  it('viser en Nav.Row for checkbox', () => {
    const periodeForkorter = shallow(<PeriodeForkorter {...props} />);
    const row = periodeForkorter.findWhere(n => n.type() === Nav.Row && n.props().className === props.checkboxClassName);

    expect(row).toHaveLength(1);
  });

  it('viser en checkbox', () => {
    const periodeForkorter = shallow(<PeriodeForkorter {...props} />);
    const checkbox = periodeForkorter.find(Skjema.Checkbox);
    const checkboxProps = checkbox.props();

    expect(checkbox).toHaveLength(1);
    expect(checkboxProps.feltNavn).toBe(props.checkboxFeltnavn);
    expect(checkboxProps.label).toBe(props.checkboxLabel);
    expect(checkboxProps.disabled).toBe(!props.redigerbart);
  });

  it('viser felter for å forkorte periode dersom forkortPeriode prop er true', () => {
    const periodeForkorter = shallow(<PeriodeForkorter {...props} />);
    const input = periodeForkorter.find(Skjema.Input);
    const inputFomProps = input.first().props();
    const inputTomProps = input.last().props();

    expect(input).toHaveLength(2);
    expect(inputFomProps.label).toBe(props.fomLabel);
    expect(inputFomProps.feltNavn).toBe(props.fomFeltNavn);
    expect(inputFomProps.disabled).toBe(true);
    expect(inputTomProps.label).toBe(props.tomLabel);
    expect(inputTomProps.feltNavn).toBe(props.tomFeltNavn);
    expect(inputTomProps.disabled).toBe(!props.redigerbart);
  });

  it('viser ikke felter for å forkorte periode dersom forkortPeriode prop er false', () => {
    props.forkortPeriode = false;

    const periodeForkorter = shallow(<PeriodeForkorter {...props} />);

    expect(periodeForkorter.find(Skjema.Input)).toHaveLength(0);
  });

  it('kaller onUncheck når checkbox blir unchecked', () => {
    const periodeForkorter = shallow(<PeriodeForkorter {...props} />);
    const checkbox = periodeForkorter.find(Skjema.Checkbox);

    const checkedEvent = { target: { checked: true } };
    checkbox.simulate('click', checkedEvent);
    expect(props.onUncheck).toHaveBeenCalledTimes(0);

    const unCheckedEvent = { target: { checked: false } };
    checkbox.simulate('click', unCheckedEvent);
    expect(props.onUncheck).toHaveBeenCalledTimes(1);
  });
});
