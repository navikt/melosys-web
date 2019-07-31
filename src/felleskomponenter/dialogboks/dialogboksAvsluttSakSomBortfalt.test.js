import React from 'react';

import * as Nav from '../../utils/navFrontend';

import { DialogboksAvsluttSakSomBortfalt } from './dialogboksAvsluttSakSomBortfalt';
import Knapperad from '../knapperad';

describe('DialogboksAvsluttSakSomBortfalt', () => {
  let props = null;

  beforeEach(() => {
    props = {
      avbryt: jest.fn(),
      redigerbart: true,
      avsluttSakSomBortfalt: jest.fn(),
      ariaHideApp: false,
      behandlingID: 1,
    };
  });

  it('viser en Nav Modal', () => {
    const dialogboks = shallow(<DialogboksAvsluttSakSomBortfalt {...props} />);
    expect(dialogboks.exists(Nav.Modal)).toBe(true);
  });

  it('sender korrekte handlere til en knapperad', () => {
    const dialogboks = shallow(<DialogboksAvsluttSakSomBortfalt {...props} />);
    const knapperad = dialogboks.find(Knapperad);

    expect(knapperad).toHaveLength(1);

    const { avbryt, bekreft } = knapperad.props();

    expect(avbryt).toBe(props.avbryt);
    expect(bekreft).toBe(props.avsluttSakSomBortfalt);
  });
});
