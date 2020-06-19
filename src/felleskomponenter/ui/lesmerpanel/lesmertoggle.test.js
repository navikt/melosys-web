import React from 'react';
import LesMerToggle from './lesmertoggle';

describe('LesMerToggle', () => {
  it('skal ikke vise lukketekst når er Aapen', () => {
    const wrapper = shallow(<LesMerToggle erApen lukkTekst="lukketekst" apneTekst="aapnetekst" onClick={() => {}} />);
    expect(wrapper.children()).toHaveLength(1);
    const divs = wrapper.find('div');
    expect(divs.last().childAt(0).text()).toBe('lukketekst');
    const chevron = wrapper.find('NavFrontendChevron');
    expect(chevron.props().type).toBe('opp');
  });
  it('skal ikke vise lukketekst når er Lukket', () => {
    const wrapper = shallow(<LesMerToggle erApen={false} lukkTekst="lukktekst" apneTekst="aapnetekst" onClick={() => {}} />);
    expect(wrapper.children()).toHaveLength(1);
    const divs = wrapper.find('div');
    expect(divs.last().childAt(0).text()).toBe('aapnetekst');
    const chevron = wrapper.find('NavFrontendChevron');
    expect(chevron.props().type).toBe('ned');
  });
});
