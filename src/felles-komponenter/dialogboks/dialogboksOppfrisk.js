import React, { Component } from 'react';
import PT from 'prop-types';

import DialogboksBekreft from './dialogboksBekreft';
import DialogboksVenter from './dialogboksVenter';

class DialogboksOppfriskSak extends Component {
  state = {
    venterResultat: false,
  };

  start = () => {
    this.setState({ venterResultat: true });
    this.props.bekreft();
  };

  render () {
    const {
      avbryt, tilForsiden, oppdater,
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
          tilForsiden={tilForsiden}
          oppdater={oppdater}
        />}
      </div>
    );
  }
}

DialogboksOppfriskSak.propTypes = {
  bekreft: PT.func.isRequired,
  avbryt: PT.func.isRequired,
  tilForsiden: PT.func.isRequired,
  oppdater: PT.func.isRequired,
};

export default DialogboksOppfriskSak;
