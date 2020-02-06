import React from 'react';
import { combineReducers, createStore } from 'redux';
import * as MKV from 'melosys-kodeverk';

import { reducer as formReducer } from 'redux-form';
import { VurderingArtikkel13_x_vedtak } from './vurderingArtikkel13_x_vedtak';

/* eslint-disable react/jsx-pascal-case */
describe('VurderingArtikkel13_x_Vedtak', () => {
  let props = null;
  let vurderingArtikkel13_x_vedtak = null;
  let form = null;

  beforeEach(() => {
    props = {
      tilstand: {
        overskrift: 'Omfattet av norsk lovgivning, etter artikkel 13, nr 1, a',
      },
      redigerbart: true,
      behandlingID: 4,
      lovvalgsperiode: {},
      endreLovvalgsPeriode: jest.fn(),
      lagreOgFatteVedtak: jest.fn(),
      formIsValid: true,
      formValues: {},
      form: 'form',
      touchAll: jest.fn(),
      handleSubmit: jest.fn(),
      byggLovvalgsperioder: jest.fn(),
      lagreLovvalgsperioder: jest.fn(),
      behandlingstype: MKV.Koder.behandlinger.behandlingstyper.SOEKNAD,
    };

    const store = createStore(combineReducers({ form: formReducer }));
    vurderingArtikkel13_x_vedtak = shallow(<VurderingArtikkel13_x_vedtak {...props} store={store} />);
    form = vurderingArtikkel13_x_vedtak.find('form');
  });

  it('vises uten å krasje', () => {
    expect(vurderingArtikkel13_x_vedtak).toBeTruthy();
  });

  it('kaller handleSubmit ved submit-event', () => {
    form.simulate('submit');
    expect(props.handleSubmit).toHaveBeenCalledTimes(1);
  });
});
