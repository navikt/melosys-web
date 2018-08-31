import React, { Component } from 'react';
import PT from 'prop-types';

import * as Nav from '../../utils/navFrontend';

import './dialogboks.css';

/* eslint react/prefer-stateless-function:off */
class Dialogboks extends Component {
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
          <div className="dialogboks__container__knapperad">
            <Nav.Hovedknapp onClick={bekreft}>OK</Nav.Hovedknapp>
            <Nav.Knapp onClick={avbryt}>Avbryt</Nav.Knapp>
          </div>
        </div>
      </Nav.Modal>
    );
  }
}

Dialogboks.propTypes = {
  tittel: PT.string.isRequired,
  tekst: PT.string.isRequired,
  synlig: PT.bool.isRequired,
  bekreft: PT.func.isRequired,
  avbryt: PT.func.isRequired,
};

Nav.Modal.setAppElement('#root');

export default Dialogboks;
