import React from 'react';

import * as Nav from '../../../utils/navFrontend';

import Begrunnelser from './begrunnelser';

describe('Begrunnelser', () => {
  let props = null;

  beforeEach(() => {
    props = {
      label: 'Begrunnelser',
      valgteBegrunnelser: ['KODE1', 'KODE2', 'KODE3'],
      muligeBegrunnelser: [{ kode: 'KODE1', term: 'Term1' }, { kode: 'KODE3', term: 'Term3' }],
      fritekst: null,
    };
  });

  it('viser label', () => {
    const begrunnelser = shallow(<Begrunnelser {...props} />);

    expect(begrunnelser.find(Nav.typo.Element).children().text()).toBe(props.label);
  });

  it('viser fritekst', () => {
    props.fritekst = 'fritekst';
    const begrunnelser = shallow(<Begrunnelser {...props} />);

    expect(begrunnelser.find('.begrunnelse').last().children().text()).toBe(props.fritekst);
  });

  it('viser korrekte begrunnelser', () => {
    const begrunnelser = shallow(<Begrunnelser {...props} />);

    const visteBegrunnelser = begrunnelser.find('.begrunnelse').map(begrunnelse => begrunnelse.text());
    expect(visteBegrunnelser).toEqual(expect.arrayContaining(['Term1', 'Term3']));
    expect(visteBegrunnelser).not.toEqual(expect.arrayContaining(['Term2']));
  });
});
