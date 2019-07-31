import React from 'react';

import * as Nav from '../utils/navFrontend';

import Knapperad from './knapperad';

describe('Knapperad', () => {
  let props = null;

  beforeEach(() => {
    props = {
      bekreft: jest.fn(),
      bekreftTekst: 'bekrefttekst',
      avbryt: jest.fn(),
      avbrytTekst: 'avbryttekst',
      redigerbart: true,
    };
  });

  it('sender handlere til knapper', () => {
    const knapperad = shallow(<Knapperad {...props} />);

    knapperad.find(Nav.Knapp).simulate('click');
    knapperad.find(Nav.Hovedknapp).simulate('click');

    expect(props.avbryt).toHaveBeenCalledTimes(1);
    expect(props.bekreft).toHaveBeenCalledTimes(1);
  });

  it('sender tekst til riktig knapp', () => {
    const knapperad = shallow(<Knapperad {...props} />);

    expect(knapperad.find(Nav.Knapp).childAt(0).text()).toBe(props.avbrytTekst);
    expect(knapperad.find(Nav.Hovedknapp).childAt(0).text()).toBe(props.bekreftTekst);
  });
});
