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
      <Nav.Row className="oppholdsland__linje">
        <Nav.Column xs={3}>
          <div className="oppholdsland__landNavn">{kodeverkObjektTilTerm(landKodeObjekt)} ({kodeverkObjektTilKode(landKodeObjekt)})</div>
        </Nav.Column>
        {!erSlettingIntensjon && (
          <div>
            <Nav.Column xs={5}>
              <div className="oppholdsland__begrunnelse">{begrunnelseTerm}dd</div>
            </Nav.Column>
            <Nav.Column xs={4}>
              {!erSlettingIntensjon && <Nav.Knapp mini onClick={settSlettIntensjon} >Fjern</Nav.Knapp> }
            </Nav.Column>
          </div>)
        }
        {erSlettingIntensjon && (
          <OppholdsLandFjerningBekreft oppholdBegrunnelser={oppholdBegrunnelser} land={landKodeObjekt} bekreft={bekreftFjern} avbryt={avbryt} />
        )
        }
      </Nav.Row>
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
