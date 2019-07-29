import React from 'react';

import Behandlingsmeny from './behandlingsmeny';
import * as Nav from '../../../utils/navFrontend';

describe('behandlingsmeny', () => {
  let props = null;

  beforeEach(() => {
    props = {
      lagreOgLukkHandle: jest.fn(),
      tilbakeleggeHandle: jest.fn(),
      oppfriskSaksopplysningerHandle: jest.fn(),
      visHenleggDialogHandle: jest.fn(),
      avsluttSakSomBortfalt: jest.fn(),
      apneTidligereBehandlinger: jest.fn(),
      redigerbart: true,
      visHenleggSak: true,
    };
  });

  it('viser en NavEkspanderbartPanelBase', () => {
    const behandlingsmeny = shallow(<Behandlingsmeny {...props} />);

    expect(behandlingsmeny.find(Nav.EkspanderbartpanelBase)).toHaveLength(1);
  });

  it('kaller handlere ved klikk på knapper', () => {
    const behandlingsmeny = shallow(<Behandlingsmeny {...props} />);

    const knapper = behandlingsmeny.find('Knapp');
    knapper.forEach(knapp => knapp.simulate('click'));

    expect(props.lagreOgLukkHandle).toHaveBeenCalledTimes(1);
    expect(props.tilbakeleggeHandle).toHaveBeenCalledTimes(1);
    expect(props.oppfriskSaksopplysningerHandle).toHaveBeenCalledTimes(1);
    expect(props.visHenleggDialogHandle).toHaveBeenCalledTimes(1);
    expect(props.avsluttSakSomBortfalt).toHaveBeenCalledTimes(1);
    expect(props.apneTidligereBehandlinger).toHaveBeenCalledTimes(1);
  });
});
