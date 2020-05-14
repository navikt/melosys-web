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
      visAvsluttSakSomBortfaltDialogHandle: jest.fn(),
      apneTidligereBehandlinger: jest.fn(),
      visAvslagSoknadDialogHandle: jest.fn(),
      visRevurderFagsakDialogHandle: jest.fn(),
      redigerbart: true,
      visHenleggSak: true,
      visAvslagManglendeOpplysninger: true,
      visRevurderFagsak: true,
    };
  });

  it('viser en NavEkspanderbartPanelBase', () => {
    const behandlingsmeny = shallow(<Behandlingsmeny {...props} />);

    expect(behandlingsmeny.find(Nav.EkspanderbartpanelBase)).toHaveLength(1);
  });

  it('kaller handlere ved klikk på knapper', () => {
    const behandlingsmeny = shallow(<Behandlingsmeny {...props} />);

    behandlingsmeny.find('Knapp').forEach(knapp => knapp.simulate('click'));

    expect(props.lagreOgLukkHandle).toHaveBeenCalledTimes(1);
    expect(props.tilbakeleggeHandle).toHaveBeenCalledTimes(1);
    expect(props.oppfriskSaksopplysningerHandle).toHaveBeenCalledTimes(1);
    expect(props.visHenleggDialogHandle).toHaveBeenCalledTimes(1);
    expect(props.visAvsluttSakSomBortfaltDialogHandle).toHaveBeenCalledTimes(1);
    expect(props.apneTidligereBehandlinger).toHaveBeenCalledTimes(1);
    expect(props.visRevurderFagsakDialogHandle).toHaveBeenCalledTimes(1);
  });
});
