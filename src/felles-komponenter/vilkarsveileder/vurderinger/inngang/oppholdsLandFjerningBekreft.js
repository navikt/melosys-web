import React, { Component } from 'react';
import PT from 'prop-types';
import { kodeverkObjektTilKode } from '../../../../utils/kodeverk';
import * as Nav from '../../../../utils/navFrontend';
import * as MPT from '../../../../proptypes';

class OppholdsLandFjerningBekreft extends Component {
  state = { begrunnelse: '0' };

  onChange = event => {
    const { value } = event.currentTarget;
    this.setState({ begrunnelse: value });
  };

  render () {
    const {
      oppholdBegrunnelser, bekreft, avbryt, land,
    } = this.props;

    const landKode = kodeverkObjektTilKode(land);

    return (
      <div className="oppholdsland__linje">
        <div className="linje__begrunnelse">
          <Nav.Select bredde="m" value={this.state.begrunnelse} onChange={this.onChange} label="Velg begrunnelse:">
            <option disabled value="0" />
            {oppholdBegrunnelser.map(enkelt => <option key={enkelt.kode} value={enkelt.kode}>{enkelt.term}</option>)}
          </Nav.Select>
        </div>
        <div className="linje__knapper">
          <Nav.Knapp className="fjern__bekreft" disabled={this.state.begrunnelse === '0'} mini onClick={() => bekreft(landKode, this.state.begrunnelse)}>Bekreft fjerning</Nav.Knapp>
          <Nav.Knapp className="fjern__avbryt" mini onClick={avbryt}>Avbryt</Nav.Knapp>
        </div>
      </div>
    );
  }
}

OppholdsLandFjerningBekreft.propTypes = {
  oppholdBegrunnelser: PT.arrayOf(MPT.Kodeverk).isRequired,
  bekreft: PT.func.isRequired,
  avbryt: PT.func.isRequired,
  land: MPT.Kodeverk.isRequired,
};

export default OppholdsLandFjerningBekreft;
