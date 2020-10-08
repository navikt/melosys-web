import React from 'react';
import MKV from '../../melosyskodeverk';
import * as Mui from '.';

import Checkboxgruppe from './checkboxgruppe';

describe('Checkboxgruppe', () => {
  let props = null;

  beforeEach(() => {
    props = {
      legend: 'Checkboxer',
      muligeValg: MKV.KTObjects.begrunnelser.arbeidsland,
      disabled: false,
      onChange: jest.fn(),
      defaultValg: [MKV.Koder.begrunnelser.arbeidsland.BASELAND],
    };
  });

  it('viser en liste med checkboxer', () => {
    const checkboxgruppe = shallow(<Checkboxgruppe {...props} />);
    const checkboxer = checkboxgruppe.find(Mui.Checkbox);

    expect(checkboxer).toHaveLength(props.muligeValg.length);
  });

  it('setter disabled korrekt', () => {
    const checkboxgruppe = shallow(<Checkboxgruppe {...props} />);
    const checkboxer = checkboxgruppe.find(Mui.Checkbox);

    checkboxer.forEach(checkbox => {
      expect(checkbox.props().disabled).toBe(props.disabled);
    });
  });

  it('sender oppdatert state til onChange handler', () => {
    const checkboxgruppe = shallow(<Checkboxgruppe {...props} />);
    let checkboxer = checkboxgruppe.find(Mui.Checkbox);
    const firstCheckbox = checkboxer.first();
    const firstCheckboxOnCheck = firstCheckbox.props().onCheck;
    const firstCheckboxValue = firstCheckbox.props().value;

    firstCheckboxOnCheck({ value: firstCheckboxValue });

    expect(props.onChange).toHaveBeenCalledTimes(1);
    expect(props.onChange).toHaveBeenLastCalledWith(expect.arrayContaining([
      MKV.Koder.begrunnelser.arbeidsland.BASELAND,
      MKV.Koder.begrunnelser.arbeidsland.SKIP_INNENRIKS,
    ]));

    checkboxer = checkboxgruppe.find(Mui.Checkbox);
    const lastCheckbox = checkboxer.last();
    const lastCheckboxOnCheck = lastCheckbox.props().onCheck;
    const lastCheckboxValue = lastCheckbox.props().value;

    lastCheckboxOnCheck({ value: lastCheckboxValue });

    expect(props.onChange).toHaveBeenCalledTimes(2);
    expect(props.onChange).toHaveBeenLastCalledWith(expect.arrayContaining([
      MKV.Koder.begrunnelser.arbeidsland.SKIP_INNENRIKS,
    ]));
    expect(props.onChange).toHaveBeenLastCalledWith(expect.not.arrayContaining([
      MKV.Koder.begrunnelser.arbeidsland.BASELAND,
    ]));
  });
});
