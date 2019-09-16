import React from 'react';
import * as MKV from 'melosys-kodeverk';

import * as KV from '../../../../kodeverk';

import Henlagtsak from './henlagtSak';
import StegerstatterBase from './stegerstatterBase';

describe('Henlagtsak', () => {
  let props = null;

  beforeEach(() => {
    props = {
      behandlingsresultat: {
        behandlingsresultatTypeKode: MKV.Koder.behandlinger.behandlingsresultattyper.HENLEGGELSE,
        begrunnelseFritekst: null,
        begrunnelseKoder: [MKV.Koder.begrunnelser.henleggelsesgrunner.SOEKNADEN_TRUKKET],
      },
    };
  });

  it('Bruker begrunnelseKoder som beskrivelse hvis ingen fritekst er oppgitt', () => {
    const henlagtsak = shallow(<Henlagtsak {...props} />);

    const beskrivelseTerm = henlagtsak.find(StegerstatterBase).props().beskrivelse;
    const beskrivelseKode = KV.termTilKode(beskrivelseTerm, MKV.KTObjects.begrunnelser.henleggelsesgrunner);

    expect(props.behandlingsresultat.begrunnelseKoder).toContain(beskrivelseKode);
  });

  it('Bruker fritekst som beskrivelse hvis fritekst er oppgitt', () => {
    props.behandlingsresultat.begrunnelseFritekst = 'Fritekst';
    const henlagtsak = shallow(<Henlagtsak {...props} />);

    expect(henlagtsak.find(StegerstatterBase).props().beskrivelse).toBe(props.behandlingsresultat.begrunnelseFritekst);
  });
});
