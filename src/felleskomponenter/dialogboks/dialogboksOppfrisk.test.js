import React from 'react';
import * as Nav from '../../utils/navFrontend';
import DialogboksOppfriskBehandling from './dialogboksOppfrisk';

describe('DialogboksOppfrisk', () => {
  let props = null;

  beforeEach(() => {
    props = {
      oppfrisk: jest.fn(),
      avbryt: jest.fn(),
      lukk: jest.fn(),
      tilForsiden: jest.fn(),
      behandlingOppfriskes: false,
      annenBehandlingOppfriskes: false,
    };
  });

  it('viser en nav modal med korrekte props', () => {
    const dialogboksOppfriskBehandling = shallow(<DialogboksOppfriskBehandling {...props} />);
    const modal = dialogboksOppfriskBehandling.find(Nav.Modal);
    const modalProps = modal.props();

    expect(modal).toHaveLength(1);
    expect(modalProps.onRequestClose).toBe(props.tilForsiden);
    expect(modalProps.closeButton).toBe(false);
    expect(modalProps.shouldCloseOnOverlayClick).toBe(false);
  });
});
