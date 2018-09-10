import React, { Component } from 'react';
import PT from 'prop-types';

import * as Nav from '../../../../utils/navFrontend';
import * as MPT from '../../../../proptypes';

import { kodeverkObjektTilKode, kodeverkObjektTilTerm } from '../../../../utils/kodeverk';
import OppholdsLandFjerningBekreft from './oppholdsLandFjerningBekreft';

class OppholdsLandEnkelt extends Component {
  state = { erSlettingIntensjon: false }

  settSlettIntensjon = () => this.setState({ erSlettingIntensjon: true });

  avbryt = () => this.setState({ erSlettingIntensjon: false });

  render () {
    const {
      landKodeObjekt, bekreftFjern, oppholdBegrunnelser,
    } = this.props;
    const { erSlettingIntensjon } = this.state;
    const { settSlettIntensjon, avbryt } = this;

    return (
      <div>
        <div className="oppholdsland__linje">
          <div className="oppholdsland__landNavn">{kodeverkObjektTilTerm(landKodeObjekt)} ({kodeverkObjektTilKode(landKodeObjekt)})</div>
          <div>{!erSlettingIntensjon && <Nav.Knapp mini onClick={settSlettIntensjon} >Fjern</Nav.Knapp> }</div>
          {erSlettingIntensjon && <OppholdsLandFjerningBekreft oppholdBegrunnelser={oppholdBegrunnelser} land={landKodeObjekt} bekreft={bekreftFjern} avbryt={avbryt} />}
        </div>
      </div>
    );
  }
}

OppholdsLandEnkelt.propTypes = {
  bekreftFjern: PT.func.isRequired,
  erGyldig: PT.bool.isRequired,
  landKodeObjekt: MPT.Kodeverk.isRequired,
  oppholdBegrunnelser: PT.arrayOf(MPT.Kodeverk).isRequired,
};

export default OppholdsLandEnkelt;
