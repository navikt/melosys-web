import React from 'react';

import * as Nav from '../../../../../utils/navFrontend';

import { VurderingVideresend } from './vurderingVideresend';
import PdfLenkeListe from '../../../../../felleskomponenter/pdfLenkeListe';

describe('Vurderingvideresend', () => {
  let props = null;

  beforeEach(() => {
    props = {
      redigerbart: true,
      behandlingID: 4,
      videresendSoknad: jest.fn(),
      bostedsland: { kode: 'SE', term: 'Sverige' },
    };
  });

  it('viser en PdfLenkeListe med korrekte props', () => {
    const vurderingVideresend = shallow(<VurderingVideresend {...props} />);

    const pdfLenkeListe = vurderingVideresend.find(PdfLenkeListe);
    const pdfLenkeListeProps = pdfLenkeListe.props();

    expect(pdfLenkeListe).toHaveLength(1);
    expect(pdfLenkeListeProps.behandlingID).toBe(props.behandlingID);
  });

  it('viser ikke pdfLenkeListe dersom ikke redigerbart', () => {
    props.redigerbart = false;
    const vurderingVideresend = shallow(<VurderingVideresend {...props} />);

    expect(vurderingVideresend.find(PdfLenkeListe)).toHaveLength(0);
  });

  describe('viser en hovedknapp', () => {
    let hovedknapp = null;

    beforeEach(() => {
      const vurderingVideresend = shallow(<VurderingVideresend {...props} />);
      hovedknapp = vurderingVideresend.find(Nav.Hovedknapp);
    });

    it('har korrekte props', () => {
      const hovedknappProps = hovedknapp.props();

      expect(hovedknapp).toHaveLength(1);
      expect(hovedknappProps.disabled).toBe(!props.redigerbart);
    });

    it('kaller videresendSoknad-prop ved klikk', () => {
      hovedknapp.simulate('click');

      expect(props.videresendSoknad).toHaveBeenCalledTimes(1);
    });
  });
});
