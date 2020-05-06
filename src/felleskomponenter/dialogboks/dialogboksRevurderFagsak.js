import React from 'react';
import PT from 'prop-types';

import * as Nav from '../../utils/navFrontend';

import Knapperad from '../knapperad';

import './dialogboksRevurderFagsak.css';

export const DialogboksRevurderFagsak = ({
  bekreft,
  avbryt,
  ariaHideApp,
  spinner,
}) => (
  <Nav.Modal
    className="dialogboksRevurderFagsak"
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

DialogboksRevurderFagsak.propTypes = {
  bekreft: PT.func.isRequired,
  avbryt: PT.func.isRequired,
  ariaHideApp: PT.bool,
  spinner: PT.bool,
};

DialogboksRevurderFagsak.defaultProps = {
  ariaHideApp: true,
  spinner: false,
};

export default DialogboksRevurderFagsak;
