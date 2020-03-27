import React from 'react';

import * as Mui from '../../ui';
import * as Nav from '../../../utils/navFrontend';

import VurderingTomtBekreftelsessteg from './vurderingTomtBekreftelsessteg';

describe('vurderingTomtBekreftelsessteg', () => {
  let props = null;

  beforeEach(() => {
    props = {
      hovedknappHandler: jest.fn(),
      redigerbart: true,
      overskrift: 'Godkjenn utpeking',
    };
  });

  it('trykk på knapp kaller hovedknappHandler', () => {
    const vurderingTomtBekreftelsessteg = shallow(<VurderingTomtBekreftelsessteg {...props} />);

    const hovedknapp = vurderingTomtBekreftelsessteg.find(Mui.Knapp);
    hovedknapp.simulate('click');

    expect(props.hovedknappHandler).toHaveBeenCalledTimes(1);
  });

  it('viser overskrift', () => {
    const vurderingTomtBekreftelsessteg = shallow(<VurderingTomtBekreftelsessteg {...props} />);

    const overskrift = vurderingTomtBekreftelsessteg.find(Nav.typo.Undertittel);

    expect(overskrift.children().text()).toBe(props.overskrift);
  });

  it('knapp er ikke disabled når redigerbar er true', () => {
    const vurderingTomtBekreftelsessteg = shallow(<VurderingTomtBekreftelsessteg {...props} />);

    const hovedknapp = vurderingTomtBekreftelsessteg.find(Mui.Knapp);

    expect(hovedknapp.props().disabled).toBe(false);
  });
});
