import React, { Component } from 'react';
import PT from 'prop-types';

import Dialogboks from '../dialogboks';
import DialogboksVenter from '../dialogboksVenter';
import * as Nav from "../../utils/navFrontend";

class OppfriskSakDialogboks extends Component {
  state = {
    venterResultat: false,
    tid: 0,
  };

  start = () => {
    this.setState({ venterResultat: true });
    this.props.bekreft();

    this.timer = setInterval(() => this.sjekkForTimeout, 10000);
  }

  sjekkForTimeout = () => {
    this.setState({ tid: this.state.tid + 10000 });

    if (this.state.tid >= 30000) {
      this.skjul();
    }
  }

  skjul = () => {
    this.reset();
    this.props.skjulDialog();
  }

  reset = () => {
    clearInterval(this.timer)
    this.setState({ tid: 0 });
    this.setState({ venterResultat: false });
  }

  render () {
    const {
      avbryt,
    } = this.props;

    return (
      <div>
        {!this.state.venterResultat &&
        <Dialogboks
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
          skjul={this.skjul}
        />}
      </div>
    );
  }
}

OppfriskSakDialogboks.propTypes = {
  bekreft: PT.func.isRequired,
  avbryt: PT.func.isRequired,
  skjulDialog: PT.func.isRequired,
};

export default OppfriskSakDialogboks;
