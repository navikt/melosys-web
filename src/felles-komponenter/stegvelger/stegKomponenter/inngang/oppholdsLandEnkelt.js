import React, { Component } from 'react';
import PT from 'prop-types';

import * as Nav from '../../../../utils/navFrontend';
import * as MPT from '../../../../proptypes';

import { kodeverkObjektTilKode, kodeverkObjektTilTerm } from '../../../../utils/kodeverk';

import OppholdslandHandlingSlett from './oppholdslandHandlingSlett';

const EnkeltLand = ({ landKodeObjekt, settSlettIntensjon }) => (
  <div className="oppholdsland__linje">
    <div className="linje__land">{kodeverkObjektTilTerm(landKodeObjekt)} ({kodeverkObjektTilKode(landKodeObjekt)})</div>
    <div className="linje__knapper"><Nav.Knapp className="knappMedIkon" onClick={settSlettIntensjon} ><Nav.Ikoner kind="minus" />Fjern</Nav.Knapp></div>
  </div>
);

EnkeltLand.propTypes = {
  landKodeObjekt: MPT.Kodeverk.isRequired,
  settSlettIntensjon: PT.func.isRequired,
};

class OppholdsLandEnkelt extends Component {
  state = { erSlettingIntensjon: false };

  settSlettIntensjon = intensjon => this.setState({ erSlettingIntensjon: intensjon });

  avbryt = () => this.settSlettIntensjon(false);

  render () {
    const {
      landKodeObjekt, bekreftFjern, oppholdBegrunnelser,
    } = this.props;
    const { erSlettingIntensjon } = this.state;
    const { settSlettIntensjon, avbryt } = this;

    return (
      <div>
        {erSlettingIntensjon ?
          <OppholdslandHandlingSlett
            oppholdBegrunnelser={oppholdBegrunnelser}
            landKodeObjekt={landKodeObjekt}
            bekreft={bekreftFjern}
            avbryt={avbryt}
          />
          :
          <EnkeltLand
            landKodeObjekt={landKodeObjekt}
            settSlettIntensjon={() => settSlettIntensjon(true)} />
        }
      </div>
    );
  }
}

OppholdsLandEnkelt.propTypes = {
  bekreftFjern: PT.func.isRequired,
  landKodeObjekt: MPT.Kodeverk.isRequired,
  oppholdBegrunnelser: PT.arrayOf(MPT.Kodeverk).isRequired,
};

export default OppholdsLandEnkelt;
