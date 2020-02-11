import React from 'react';

import Knapp from './knapp';

import * as Nav from '../../utils/navFrontend';

describe('knapp', () => {
  let props = null;

  beforeEach(() => {
    props = {
      ikon: 'ikonpath',
      children: 'child',
    };
  });

  it('viser en NAV knapp', () => {
    const knapp = shallow(<Knapp {...props} />);

    expect(knapp.find(Nav.Knapp)).toHaveLength(1);
  });

  it('viser et ikon tilsvarende ikon-prop', () => {
    const knapp = shallow(<Knapp {...props} />);

    expect(knapp.find('img').props().src).toBe(props.ikon);
  });

  it('viser children-prop', () => {
    const knapp = shallow(<Knapp {...props} />);
    const passedChildren = knapp.find(Nav.Knapp).children().not('img');

    expect(passedChildren.text()).toBe(props.children);
  });
});
