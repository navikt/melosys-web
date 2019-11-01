import React from 'react';
import * as MKV from 'melosys-kodeverk';
import * as Nav from '../../utils/navFrontend';

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
    const checkboxer = checkboxgruppe.find(Nav.Checkbox);

    expect(checkboxer).toHaveLength(props.muligeValg.length);
  });

  it('setter disabled korrekt', () => {
    const checkboxgruppe = shallow(<Checkboxgruppe {...props} />);
    const checkboxer = checkboxgruppe.find(Nav.Checkbox);

    checkboxer.forEach(checkbox => {
      expect(checkbox.props().disabled).toBe(props.disabled);
    });
  });

  it('sender oppdatert state til onChange handler', () => {
    const checkboxgruppe = shallow(<Checkboxgruppe {...props} />);
    const checkboxer = checkboxgruppe.find(Nav.Checkbox);

    const event = { target: { value: '' } };
    checkboxer.last().simulate('change', event);

    expect(props.onChange).toHaveBeenCalledTimes(1);
  });
});
