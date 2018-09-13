import React, { Component } from 'react';
import PT from 'prop-types';

import * as Nav from '../../../../utils/navFrontend';
import * as MPT from '../../../../proptypes';

import { kodeverkObjektTilKode, kodeverkObjektTilTerm } from '../../../../utils/kodeverk';
import OppholdslandHandlingSlett from './oppholdslandHandlingSlett';

const EnkeltLinje = ({ landKodeObjekt, settSlettIntensjon }) => (
  <div className="oppholdsland__linje">
    <div className="linje__land">{kodeverkObjektTilTerm(landKodeObjekt)} ({kodeverkObjektTilKode(landKodeObjekt)})</div>
    <div className="linje__knapper"><Nav.Knapp mini className="knappMedIkon" onClick={settSlettIntensjon} ><Nav.Ikoner kind="minus" />Fjern</Nav.Knapp></div>
  </div>
);

EnkeltLinje.propTypes = {
  landKodeObjekt: MPT.Kodeverk.isRequired,
  settSlettIntensjon: PT.func.isRequired,
};

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
        {!erSlettingIntensjon ?
          <EnkeltLinje
            landKodeObjekt={landKodeObjekt}
            settSlettIntensjon={settSlettIntensjon} />
          :
          <OppholdslandHandlingSlett
            oppholdBegrunnelser={oppholdBegrunnelser}
            landKodeObjekt={landKodeObjekt}
            bekreft={bekreftFjern}
            avbryt={avbryt}
            settSlettIntensjon={settSlettIntensjon}
          />
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

OppholdsLandEnkelt.defaultProps = {
  begrunnelseKode: '',
};

export default OppholdsLandEnkelt;
