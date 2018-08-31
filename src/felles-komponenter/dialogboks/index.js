import React, { Component } from 'react';
import PT from 'prop-types';
import { Portal } from 'react-portal';

import * as Nav from '../../utils/navFrontend';

// import './dialogboks.css';

/* eslint react/prefer-stateless-function:off */
class Dialogboks extends Component {
  render () {
    const { tittel, tekst, synlig } = this.props;
    return (
      <Nav.Modal className="dialogboks" isOpen={synlig} contentLabel="Bekrefte oppfrisking" shouldCloseOnOverlayClick>
        <div>
          <Nav.Panel className="dialogboks__container">
            <Nav.Systemtittel>{tittel}</Nav.Systemtittel>
            <Nav.Normaltekst>{tekst}</Nav.Normaltekst>
            <div className="dialogboks__container__knapperad">
              <Nav.Hovedknapp>OK</Nav.Hovedknapp>
              <Nav.Knapp onClick={this.props.avbryt}>Avbryt</Nav.Knapp>
            </div>
          </Nav.Panel>
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
