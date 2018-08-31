import React, { Component } from 'react';
import PT from 'prop-types';

import * as Nav from '../../utils/navFrontend';

import './dialogboks.css';

/* eslint react/prefer-stateless-function:off */
class Dialogboks extends Component {
  render () {
    const {
      tittel, tekst, synlig, avbryt,
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
            <Nav.Hovedknapp>OK</Nav.Hovedknapp>
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
  avbryt: PT.func.isRequired,
};

Dialogboks.defaultProps = {

};

export default Dialogboks;
