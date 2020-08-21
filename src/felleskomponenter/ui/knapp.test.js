import React from 'react';

import Knapp from './knapp';

import * as Nav from '../../utils/navFrontend';

describe('knapp', () => {
  let props = null;

  beforeEach(() => {
    props = {
      ikon: 'Pencil',
      children: 'child',
    };
  });

  it('viser en NAV knapp', () => {
    const knapp = shallow(<Knapp {...props} />);

    expect(knapp.find(Nav.Knapp)).toHaveLength(1);
  });

  it('viser et ikon tilsvarende ikon-prop', () => {
    const knapp = shallow(<Knapp {...props} />);

    expect(knapp.find(props.ikon)).toHaveLength(1);
  });

  it('viser children-prop', () => {
    const knapp = shallow(<Knapp {...props} />);
    const passedChildren = knapp.find(Nav.Knapp).children().not(props.ikon);

    expect(passedChildren.text()).toBe(props.children);
  });
});
