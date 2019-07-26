import React from 'react';

import * as Nav from '../../utils/navFrontend';

import { DialogboksAvslagSoknad } from './dialogboksAvslagSoknad';

describe('DialogboksAvslagSoknad', () => {
  let props = null;

  beforeEach(() => {
    props = {
      avbryt: jest.fn(),
      redigerbart: true,
      avslaaSoknad: jest.fn(),
      ariaHideApp: false,
      behandlingID: 1,
    };
  });

  it('viser en Nav Modal', () => {
    const komponent = mount(<DialogboksAvslagSoknad {...props} />);
    expect(komponent.exists('Modal')).toBe(true);
  });

  it('passer handlere til knapper', () => {
    const komponent = mount(<DialogboksAvslagSoknad {...props} />);

    komponent.find(Nav.Knapp).forEach(knapp => knapp.simulate('click'));
    komponent.find(Nav.Hovedknapp).forEach(knapp => knapp.simulate('click'));

    expect(props.avbryt).toHaveBeenCalledTimes(1);
    expect(props.avslaaSoknad).toHaveBeenCalledTimes(1);
  });
});

