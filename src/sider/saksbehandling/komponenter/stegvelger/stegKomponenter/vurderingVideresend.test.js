import React from 'react';
import { combineReducers, createStore } from 'redux';
import { reducer as formReducer } from 'redux-form';

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
      handleSubmit: jest.fn(),
      oppdaterMottakerinstitusjon: () => {},
      oppdaterKreverMottakerinstitusjon: () => {},
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
    let form = null;

    beforeEach(() => {
      const store = createStore(combineReducers({ form: formReducer }));
      const vurderingVideresend = shallow(<VurderingVideresend {...props} store={store} />);

      form = vurderingVideresend.find('form');
      hovedknapp = vurderingVideresend.find(Nav.Hovedknapp);
    });

    it('har korrekte props', () => {
      const hovedknappProps = hovedknapp.props();

      expect(hovedknapp).toHaveLength(1);
      expect(hovedknappProps.disabled).toBe(!props.redigerbart);
    });

    it('kaller videresendSoknad-prop ved klikk', () => {
      form.simulate('submit');
      expect(props.handleSubmit).toHaveBeenCalledTimes(1);
    });
  });
});
