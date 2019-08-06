import React, { Component } from 'react';
import PT from 'prop-types';

import * as Nav from '../../utils/navFrontend';

import Knapperad from '../knapperad';

import './dialogboksBekreft.css';

/* eslint react/prefer-stateless-function:off */
class DialogboksBekreft extends Component {
  render () {
    const {
      tittel, tekst, synlig, avbryt, bekreft,
    } = this.props;

    return (
      <Nav.Modal
        className="dialogboks"
        isOpen={synlig}
        contentLabel="Bekrefte oppfrisking"
        onRequestClose={avbryt}
        closeButton={false}
        shouldCloseOnOverlayClick>
        <div>
          <Nav.Systemtittel>{tittel}</Nav.Systemtittel>
          <Nav.Normaltekst>{tekst}</Nav.Normaltekst>
          <div className="knapperadcontainer">
            <Knapperad
              bekreft={bekreft}
              bekreftTekst="Fortsett oppdatering"
              avbryt={avbryt}
              avbrytTekst="Avbryt oppdatering"
              redigerbart
            />
          </div>
        </div>
      </Nav.Modal>
    );
  }
}

DialogboksBekreft.propTypes = {
  tittel: PT.string.isRequired,
  tekst: PT.string.isRequired,
  synlig: PT.bool.isRequired,
  bekreft: PT.func.isRequired,
  avbryt: PT.func.isRequired,
};

Nav.Modal.setAppElement('#root');

export default DialogboksBekreft;
