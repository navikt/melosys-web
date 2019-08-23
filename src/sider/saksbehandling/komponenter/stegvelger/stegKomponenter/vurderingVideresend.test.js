import React from 'react';

import * as Nav from '../../../../../utils/navFrontend';

import { VurderingVideresend } from './vurderingVideresend';
import PdfLenkeListe from '../../../../../felleskomponenter/pdfLenkeListe';

describe('Vurderingvideresen', () => {
  let props = null;

  beforeEach(() => {
    props = {
      redigerbart: true,
      behandlingID: 4,
      tilstand: {
        bostedslandFakta: {
          avklartefaktaKode: 'IKKE_BOSATT_NORGE',
          begrunnelseFritekst: 'Søknad skal ikke behandles i Norge',
          begrunnelseKoder: [],
          fakta: null,
          referanse: 'IKKE_BOSATT_NORGE',
          subjektID: null,
        },
      },
      oppdaterData: jest.fn(),
      slettData: jest.fn(),
      lagreAvklartefaktaOgVideresendSoknad: jest.fn(),
      lagreAvklartefakta: jest.fn(),
    };
  });

  it('viser en Nav textarea med korrekte props', () => {
    const vurderingVideresend = shallow(<VurderingVideresend {...props} />);

    const textarea = vurderingVideresend.find(Nav.Textarea);
    const textareaProps = textarea.props();

    expect(textarea).toHaveLength(1);
    expect(textareaProps.disabled).toBe(!props.redigerbart);
    expect(textareaProps.value).toBe(props.tilstand.bostedslandFakta.begrunnelseFritekst);
  });

  it('viser en PdfLenkeListe med korrekte props', () => {
    const vurderingVideresend = shallow(<VurderingVideresend {...props} />);

    const pdfLenkeListe = vurderingVideresend.find(PdfLenkeListe);
    const pdfLenkeListeProps = pdfLenkeListe.props();

    expect(pdfLenkeListe).toHaveLength(1);
    expect(pdfLenkeListeProps.behandlingID).toBe(props.behandlingID);
    expect(pdfLenkeListeProps.vedKlikk).toBe(props.lagreAvklartefakta);
  });

  it('viser ikke pdfLenkeListe dersom ikke redigerbart', () => {
    props.redigerbart = false;
    const vurderingVideresend = shallow(<VurderingVideresend {...props} />);

    expect(vurderingVideresend.find(PdfLenkeListe)).toHaveLength(0);
  });

  it('viser en Nav hovedknapp med korrekte props', () => {
    const vurderingVideresend = shallow(<VurderingVideresend {...props} />);

    const hovedknapp = vurderingVideresend.find(Nav.Hovedknapp);
    const hovedknappProps = hovedknapp.props();

    expect(hovedknapp).toHaveLength(1);
    expect(hovedknappProps.disabled).toBe(!props.redigerbart);
    expect(hovedknappProps.onClick).toBe(props.lagreAvklartefaktaOgVideresendSoknad);
  });
});
