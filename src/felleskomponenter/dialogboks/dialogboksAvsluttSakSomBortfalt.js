import React from 'react';
import PT from 'prop-types';
import { connect } from 'react-redux';

import * as Nav from '../../utils/navFrontend';

import Knapperad from '../knapperad';

import { redigerbartSelectors } from '../../ducks/redigerbart';

import './dialogboksAvsluttSakSomBortfalt.css';

export const DialogboksAvsluttSakSomBortfalt = ({
  avsluttSakSomBortfalt, avbryt, redigerbart, ariaHideApp,
}) => (
  <Nav.Modal
    className="dialogboksAvsluttSakSomBortfalt"
    isOpen
    contentLabel="Avslå sak som bortfalt"
    onRequestClose={avbryt}
    closeButton={false}
    shouldCloseOnOverlayClick
    ariaHideApp={ariaHideApp}>
    <Nav.Systemtittel className="overskrift">Avslutt sak som bortfalt</Nav.Systemtittel>
    <Knapperad
      bekreft={avsluttSakSomBortfalt}
      bekreftTekst="AVSLUTT SAK"
      avbryt={avbryt}
      avbrytTekst="AVBRYT"
      redigerbart={redigerbart}
    />
  </Nav.Modal>
);

DialogboksAvsluttSakSomBortfalt.propTypes = {
  avsluttSakSomBortfalt: PT.func.isRequired,
  avbryt: PT.func.isRequired,
  ariaHideApp: PT.bool,
  redigerbart: PT.bool.isRequired,
};

DialogboksAvsluttSakSomBortfalt.defaultProps = {
  ariaHideApp: true,
};

const mapStateToProps = state => ({
  redigerbart: redigerbartSelectors.RedigerbartSelector(state),
});

export default connect(mapStateToProps)(DialogboksAvsluttSakSomBortfalt);
