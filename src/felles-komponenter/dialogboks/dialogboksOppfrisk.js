import React, { Component } from 'react';
import PT from 'prop-types';

import DialogboksBekreft from './dialogboksBekreft';
import DialogboksVenter from './dialogboksVenter';

class OppfriskSakDialogboks extends Component {
  oppdateringintervall = 1000;
  timeoutTid = 30000;

  state = {
    venterResultat: false,
    tid: 0,
  };

  componentWillUnmount() {
    clearInterval(this.timer)
  }

  start = () => {
    this.timer = setInterval(this.sjekkForTimeout, this.oppdateringintervall);
    this.setState({ venterResultat: true });
    this.props.bekreft();
  }

  sjekkForTimeout = () => {
    console.log("Sjekk timeout: "+ this.state.tid)
    this.setState({ tid: this.state.tid + this.oppdateringintervall });

    if (this.state.tid >= this.timeoutTid) {
      this.props.skjulDialog();
    }
    else {
      this.props.oppdater();
    }
  }

  render () {
    const {
      avbryt, skjulDialog
    } = this.props;

    return (
      <div>
        {!this.state.venterResultat &&
        <DialogboksBekreft
          tittel="Vil du oppdatere registeropplysninger?"
          tekst="Oppdatering av registeropplysning kan ta noe tid. Du vil derfor bli sendt tilbake til oppgavelisten hvor du kan journalføre eller behandle en annen sak i mellomtiden."
          bekreft={this.start}
          avbryt={avbryt}
          synlig
        />
        }
        {this.state.venterResultat &&
        <DialogboksVenter
          tittel="Oppdaterer registeropplysninger"
          tekst="Oppdatering av registeropplysning kan ta noen minutter, venligst vent."
          synlig
          skjul={skjulDialog}
        />}
      </div>
    );
  }
}

OppfriskSakDialogboks.propTypes = {
  bekreft: PT.func.isRequired,
  avbryt: PT.func.isRequired,
  skjulDialog: PT.func.isRequired,
  oppdater: PT.func.isRequired,
};

export default OppfriskSakDialogboks;
