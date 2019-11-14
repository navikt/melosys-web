import React from 'react';
import { connect } from 'react-redux';
import PT from 'prop-types';

import * as Nav from '../../utils/navFrontend';

import { redigerbartSelectors } from '../../ducks/redigerbart';

import Knapperad from '../knapperad';

import './dialogboksRevurderVedtak.css';

export const DialogboksRevurderVedtak = ({
  bekreft,
  avbryt,
  ariaHideApp,
  spinner,
  redigerbart,
}) => (
  <Nav.Modal
    className="dialogboksRevurderVedtak"
    isOpen
    contentLabel="Revurder vedtak"
    onRequestClose={avbryt}
    closeButton={false}
    shouldCloseOnOverlayClick
    ariaHideApp={ariaHideApp}>
    <Nav.Systemtittel className="overskrift">Vurder vedtak på nytt</Nav.Systemtittel>
    <Knapperad
      bekreft={bekreft}
      bekreftTekst="BEKREFT"
      avbryt={avbryt}
      avbrytTekst="AVBRYT"
      redigerbart={!redigerbart}
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

const mapStateToProps = state => ({
  redigerbart: redigerbartSelectors.RedigerbartSelector(state),
});

export default connect(mapStateToProps)(DialogboksRevurderVedtak);
