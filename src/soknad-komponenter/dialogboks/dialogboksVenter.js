import React, { Component } from 'react';
import PT from 'prop-types';

import * as Nav from '../../utils/navFrontend';

import './dialogboksVenter.css';

/* eslint react/prefer-stateless-function:off */
class DialogboksVenter extends Component {
  constructor() {
    super();
    this.state = { venteTid: 0 };

    this.MAKS_VENTETID = 15000;
    this.OPPDATERING_INTERVALL = 5000;
  }

  componentDidMount = () => {
    this.timer = setInterval(this.sjekkStatus, this.OPPDATERING_INTERVALL);
  };

  componentWillUnmount() {
    clearInterval(this.timer);
  }

  sjekkStatus = () => {
    const venteTid = this.state.venteTid + this.OPPDATERING_INTERVALL;
    this.setState({ venteTid }, () => {
      this.props.oppdater();
    });
  };

  render () {
    const {
      tittel, tekst, synlig, tilForsiden,
    } = this.props;

    const venteTekst = this.state.venteTid < this.MAKS_VENTETID ?
      <Nav.Normaltekst className="tekst">{tekst}</Nav.Normaltekst>
      :
      <Nav.AlertStripe className="alertStripe" type="advarsel">
        Dette tar lengre tid enn normalt. Du kan velge å gå tilbake til forsiden for å behandle en annen sak i mellomtiden.
      </Nav.AlertStripe>;

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
          <Nav.Systemtittel className="overskrift">{tittel}</Nav.Systemtittel>
          {venteTekst}
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
