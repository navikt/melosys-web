import React from 'react';

import * as Nav from '../../utils/navFrontend';

import { DialogboksRevurderVedtak } from './dialogboksRevurderVedtak';
import Knapperad from '../knapperad';

describe('DialogboksRevurderVedtak', () => {
  let props = null;

  beforeEach(() => {
    props = {
      bekreft: jest.fn(),
      avbryt: jest.fn(),
      ariaHideApp: false,
      spinner: false,
      redigerbart: false,
    };
  });

  it('viser en nav modal med korrekte props', () => {
    const dialogboksRevurderVedtak = shallow(<DialogboksRevurderVedtak {...props} />);
    const modal = dialogboksRevurderVedtak.find(Nav.Modal);
    const modalProps = modal.props();

    expect(modal).toHaveLength(1);
    expect(modalProps.ariaHideApp).toBe(props.ariaHideApp);
    expect(modalProps.onRequestClose).toBe(props.avbryt);
    expect(modalProps.closeButton).toBe(false);
  });

  it('viser en knapperad med korrekte props', () => {
    const dialogboksRevurderVedtak = shallow(<DialogboksRevurderVedtak {...props} />);
    const knapperad = dialogboksRevurderVedtak.find(Knapperad);
    const knapperadProps = knapperad.props();

    expect(knapperadProps.spinner).toBe(props.spinner);
    expect(knapperadProps.bekreft).toBe(props.bekreft);
    expect(knapperadProps.avbryt).toBe(props.avbryt);
    expect(knapperadProps.redigerbart).toBe(!props.redigerbart);
  });
});
