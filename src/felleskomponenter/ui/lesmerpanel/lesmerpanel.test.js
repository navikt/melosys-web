
import React from 'react';

import Lesmerpanel from './lesmerpanel';

describe('Lesmerpanel', () => {
  it('skal ikke vise lukketekst når er Aapen', () => {
    const lesmerPanel = (
      <Lesmerpanel
        defaultApen
        onClose={() => {}}
        onOpen={() => {}}
        intro="Dette er intro"
        lukkTekst="lukketekst"
        apneTekst="aapnetekst"
      >
        {[<span key={1}>innholdstekst</span>]}
      </Lesmerpanel>
    );

    const wrapper = shallow(lesmerPanel);

    expect(wrapper.children()).toHaveLength(2);
    const divs = wrapper.find('div');

    const lesmertoggle = wrapper.find('LesMerToggle');
    expect(lesmertoggle.length).toBe(1);
    const intro = divs.at(2);
    expect(intro.childAt(0).text()).toBe('Dette er intro');
    const innhold = divs.at(5);
    expect(innhold.childAt(0).text()).toBe('innholdstekst');
  });
});
