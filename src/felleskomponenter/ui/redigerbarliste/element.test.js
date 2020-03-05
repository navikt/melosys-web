import React from 'react';

import * as Nav from '../../../utils/navFrontend';
import * as Mui from '../';

import Element from './element';

describe('Element', () => {
  let props = null;

  beforeEach(() => {
    props = {
      kode: 'kode',
      term: 'term',
      onFjern: jest.fn(),
      onAngreFjern: jest.fn(),
      fjernbar: true,
      redigerbar: true,
      defaultFjernet: false,
    };
  });

  it('viser term i første kolonne', () => {
    const element = shallow(<Element {...props} />);

    expect(element.find(Nav.Column).first().children().text()).toBe('term');
  });

  it('viser knapp for å fjerne element dersom fjernbar', () => {
    const element = shallow(<Element {...props} />);

    const knapp = element.find(Mui.Knapp);
    expect(knapp).toHaveLength(1);

    knapp.simulate('click');

    expect(props.onFjern).toHaveBeenCalledTimes(1);
  });

  it('gjemmer knapp for å fjerne element dersom fjernbar', () => {
    props.fjernbar = false;
    const element = shallow(<Element {...props} />);

    const knapp = element.find(Mui.Knapp);
    expect(knapp).toHaveLength(0);
  });

  it('viser knapp for å angre fjerning av element', () => {
    props.defaultFjernet = true;
    const element = shallow(<Element {...props} />);

    const knapp = element.find(Mui.Knapp);
    expect(knapp).toHaveLength(1);

    knapp.simulate('click');

    expect(props.onAngreFjern).toHaveBeenCalledTimes(1);
  });
});
