import React from 'react';

import * as Mui from '../felleskomponenter/ui';

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

  const findHovedKnapp = knapperad => knapperad.find(Mui.Knapp).filterWhere(n => n.props().type === 'hoved');
  const findAvbrytKnapp = knapperad => knapperad.find(Mui.Knapp).filterWhere(n => n.props().type !== 'hoved');

  it('sender handlere til knapper', () => {
    const knapperad = shallow(<Knapperad {...props} />);

    findHovedKnapp(knapperad).simulate('click');
    findAvbrytKnapp(knapperad).simulate('click');

    expect(props.avbryt).toHaveBeenCalledTimes(1);
    expect(props.bekreft).toHaveBeenCalledTimes(1);
  });

  it('sender tekst til riktig knapp', () => {
    const knapperad = shallow(<Knapperad {...props} />);

    expect(findAvbrytKnapp(knapperad).childAt(0).text()).toBe(props.avbrytTekst);
    expect(findHovedKnapp(knapperad).childAt(0).text()).toBe(props.bekreftTekst);
  });

  it('redigerbart-prop setter disabled korrekt', () => {
    let knapperad = shallow(<Knapperad {...props} />);

    expect(findAvbrytKnapp(knapperad).props().disabled).toBe(false);
    expect(findHovedKnapp(knapperad).props().disabled).toBe(false);

    props.redigerbart = false;

    knapperad = shallow(<Knapperad {...props} />);

    expect(findAvbrytKnapp(knapperad).props().disabled).toBe(true);
    expect(findHovedKnapp(knapperad).props().disabled).toBe(true);
  });

  it('bekreftRedigerbart-prop setter disabled korrekt', () => {
    let knapperad = shallow(<Knapperad {...props} />);

    expect(findHovedKnapp(knapperad).props().disabled).toBe(false);
    expect(findAvbrytKnapp(knapperad).props().disabled).toBe(false);


    props.bekreftRedigerbart = false;

    knapperad = shallow(<Knapperad {...props} />);

    expect(findAvbrytKnapp(knapperad).props().disabled).toBe(false);
    expect(findHovedKnapp(knapperad).props().disabled).toBe(true);
  });
});
