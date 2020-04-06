import React from 'react';
import PT from 'prop-types';

import * as Nav from '../../utils/navFrontend';

import Knapperad from '../knapperad';

import './dialogboksRevurderVedtak.css';

export const DialogboksRevurderVedtak = ({
  bekreft,
  avbryt,
  ariaHideApp,
  spinner,
}) => (
  <Nav.Modal
    className="dialogboksRevurderVedtak"
    isOpen
    contentLabel="Revurder vedtak"
    onRequestClose={avbryt}
    closeButton={false}
    shouldCloseOnOverlayClick
    ariaHideApp={ariaHideApp}>
    <Nav.typo.Systemtittel className="overskrift">Vurder vedtak på nytt</Nav.typo.Systemtittel>
    <Knapperad
      bekreft={bekreft}
      bekreftTekst="BEKREFT"
      avbryt={avbryt}
      avbrytTekst="AVBRYT"
      redigerbart
      spinner={spinner}
    />
  </Nav.Modal>
);

DialogboksRevurderVedtak.propTypes = {
  bekreft: PT.func.isRequired,
  avbryt: PT.func.isRequired,
  ariaHideApp: PT.bool,
  spinner: PT.bool,
  redigerbart: PT.bool.isRequired,
};

DialogboksRevurderVedtak.defaultProps = {
  ariaHideApp: true,
  spinner: false,
};

export default DialogboksRevurderVedtak;
