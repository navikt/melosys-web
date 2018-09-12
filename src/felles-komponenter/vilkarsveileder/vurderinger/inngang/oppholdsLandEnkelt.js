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
      landKodeObjekt, begrunnelseKode, bekreftFjern, oppholdBegrunnelser,
    } = this.props;
    const { erSlettingIntensjon } = this.state;
    const { settSlettIntensjon, avbryt } = this;

    const begrunnelseTerm = begrunnelseKode && kodeverkObjektTilTerm(oppholdBegrunnelser.find(begrunnelse => begrunnelse.kode === begrunnelseKode));

    return (
      <div className="oppholdsland__linje">
        <div className="linje__land">{kodeverkObjektTilTerm(landKodeObjekt)} ({kodeverkObjektTilKode(landKodeObjekt)})</div>
        {!erSlettingIntensjon && (<div className="linje__begrunnelse">{begrunnelseTerm}</div>) }
        {!erSlettingIntensjon && (<div className="linje__knapp">{!erSlettingIntensjon && <Nav.Knapp mini onClick={settSlettIntensjon} >Fjern</Nav.Knapp> }</div>) }
        {erSlettingIntensjon && (
          <OppholdsLandFjerningBekreft oppholdBegrunnelser={oppholdBegrunnelser} land={landKodeObjekt} bekreft={bekreftFjern} avbryt={avbryt} />
        )
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
