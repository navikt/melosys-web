import React, { Component } from 'react';
import PT from 'prop-types';

import * as Nav from '../../utils/navFrontend';

import './dialogboksVenter.css';

/* eslint react/prefer-stateless-function:off */
class DialogboksVenter extends Component {
  state = {
    tid: 0,
  };

  componentDidMount = () => {
    this.timer = setInterval(this.sjekkForTimeout, this.oppdateringintervall);
  };

  componentWillUnmount() {
    clearInterval(this.timer);
  }

  oppdateringintervall = 10000;
  timeoutTid = 30000;

  sjekkForTimeout = () => {
    this.setState({ tid: this.state.tid + this.oppdateringintervall });

    if (this.state.tid >= this.timeoutTid) {
      if (this.props.tilForsiden) { this.props.tilForsiden(); }
    } else {
      this.props.oppdater();
    }
  };

  render () {
    const {
      tittel, tekst, synlig, tilForsiden,
    } = this.props;

    return (
      <Nav.Modal
        className="dialogboksVenter"
        isOpen={synlig}
        contentLabel="Jobber med å oppfriske"
        onRequestClose={tilForsiden}
        closeButton={false}
        shouldCloseOnOverlayClick={false}>
        <div>
          <Nav.NavFrontendSpinner className="spinner" />
          <Nav.Systemtittel className="tekst">{tittel}</Nav.Systemtittel>
          <Nav.Normaltekst className="tekst">{tekst}</Nav.Normaltekst>
          <div className="dialogboksVenter__container__knapperad">
            <Nav.Knapp onClick={tilForsiden}>Til forsiden</Nav.Knapp>
          </div>
        </div>
      </Nav.Modal>
    );
  }
}

DialogboksVenter.propTypes = {
  tittel: PT.string.isRequired,
  tekst: PT.string.isRequired,
  synlig: PT.bool.isRequired,
  tilForsiden: PT.func.isRequired,
  oppdater: PT.func.isRequired,
};

Nav.Modal.setAppElement('#root');

export default DialogboksVenter;
