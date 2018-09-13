import React, { Component } from 'react';
import PT from 'prop-types';

import * as Nav from '../../../../utils/navFrontend';
import * as MPT from '../../../../proptypes';

import { kodeverkObjektTilKode, kodeverkObjektTilTerm } from '../../../../utils/kodeverk';
import OppholdsLandFjerningBekreft from './oppholdsLandFjerningBekreft';

const EnkeltLinje = ({ landKodeObjekt, begrunnelseTerm, settSlettIntensjon }) => (
  <div className="oppholdsland__linje">
    <div className="linje__land">{kodeverkObjektTilTerm(landKodeObjekt)} ({kodeverkObjektTilKode(landKodeObjekt)})</div>
    <div className="linje__begrunnelse">{begrunnelseTerm}</div>
    <div className="linje__knapper"><Nav.Knapp mini className="knappMedIkon" onClick={settSlettIntensjon} ><Nav.Ikoner kind="minus" />Fjern</Nav.Knapp></div>
  </div>
);

EnkeltLinje.propTypes = {
  landKodeObjekt: MPT.Kodeverk.isRequired,
  begrunnelseTerm: PT.string.isRequired,
  settSlettIntensjon: PT.func.isRequired,
};

class OppholdsLandEnkelt extends Component {
  state = { erSlettingIntensjon: false }

  settSlettIntensjon = () => this.setState({ erSlettingIntensjon: true });

  avbryt = () => this.setState({ erSlettingIntensjon: false });

  render () {
    const {
      landKodeObjekt, begrunnelseKode, bekreftFjern, oppholdBegrunnelser,
    } = this.props;
    const { erSlettingIntensjon } = this.state;
    const { settSlettIntensjon, avbryt } = this;

    const begrunnelseTerm = begrunnelseKode && kodeverkObjektTilTerm(oppholdBegrunnelser.find(begrunnelse => begrunnelse.kode === begrunnelseKode));

    return (
      <div>
        {!erSlettingIntensjon ?
          <EnkeltLinje landKodeObjekt={landKodeObjekt} begrunnlseTerm={begrunnelseTerm} settSlettIntensjon={settSlettIntensjon} />
          :
          <OppholdsLandFjerningBekreft
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
  begrunnelseKode: PT.string,
  oppholdBegrunnelser: PT.arrayOf(MPT.Kodeverk).isRequired,
};

OppholdsLandEnkelt.defaultProps = {
  begrunnelseKode: '',
};

export default OppholdsLandEnkelt;
