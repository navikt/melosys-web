import React, { Component } from 'react';
import PT from 'prop-types';

import * as Nav from '../../utils/navFrontend';

import './dialogboksVenter.css';

/* eslint react/prefer-stateless-function:off */
class DialogboksVenter extends Component {

  oppdateringintervall = 1000;
  timeoutTid = 30000;

  state = {
    tid: 0,
  };

  componentWillUnmount() {
    clearInterval(this.timer)
  }

  componentDidMount = () => {
    this.timer = setInterval(this.sjekkForTimeout, this.oppdateringintervall);
  }

  sjekkForTimeout = () => {
    console.log("Sjekk timeout: "+ this.state.tid)
    this.setState({ tid: this.state.tid + this.oppdateringintervall });

    if (this.state.tid >= this.timeoutTid) {
      this.props.skjul();
    }
    else {
      this.props.oppdater();
    }
  }

  render () {
    const {
      tittel, tekst, synlig, skjul,
    } = this.props;

    return (
      <Nav.Modal
        className="dialogboksVenter"
        isOpen={synlig}
        contentLabel="Jobber med å oppfriske"
        onRequestClose={skjul}
        closeButton={false}
        shouldCloseOnOverlayClick={false}>
        <div>
          <Nav.NavFrontendSpinner className="spinner" />
          <Nav.Systemtittel className="tekst">{tittel}</Nav.Systemtittel>
          <Nav.Normaltekst className="tekst">{tekst}</Nav.Normaltekst>
          <div className="dialogboksVenter__container__knapperad">
            <Nav.Hovedknapp onClick={skjul}>Skjul</Nav.Hovedknapp>
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
  skjul: PT.func.isRequired,
  oppdater: PT.func,
};

Nav.Modal.setAppElement('#root');

export default DialogboksVenter;
