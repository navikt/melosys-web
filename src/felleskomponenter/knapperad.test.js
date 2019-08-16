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
      bekreftRedigerbart: true,
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

  it('redigerbart-prop setter disabled korrekt', () => {
    let knapperad = shallow(<Knapperad {...props} />);

    expect(knapperad.find(Nav.Knapp).props().disabled).toBe(false);
    expect(knapperad.find(Nav.Hovedknapp).props().disabled).toBe(false);

    props.redigerbart = false;

    knapperad = shallow(<Knapperad {...props} />);

    expect(knapperad.find(Nav.Knapp).props().disabled).toBe(true);
    expect(knapperad.find(Nav.Hovedknapp).props().disabled).toBe(true);
  });

  it('bekreftRedigerbart-prop setter disabled korrekt', () => {
    let knapperad = shallow(<Knapperad {...props} />);

    expect(knapperad.find(Nav.Hovedknapp).props().disabled).toBe(false);
    expect(knapperad.find(Nav.Knapp).props().disabled).toBe(false);


    props.bekreftRedigerbart = false;

    knapperad = shallow(<Knapperad {...props} />);

    expect(knapperad.find(Nav.Knapp).props().disabled).toBe(false);
    expect(knapperad.find(Nav.Hovedknapp).props().disabled).toBe(true);
  });
});
