import React, { Component } from 'react';
import PT from 'prop-types';
import { kodeverkObjektTilKode, kodeverkObjektTilTerm } from '../../../../kodeverk/kodeverk';
import * as Nav from '../../../../utils/navFrontend';
import * as MPT from '../../../../proptypes';

class OppholdslandHandlingSlett extends Component {
  state = { begrunnelse: '0' };

  onChange = event => {
    const { value } = event.currentTarget;
    this.setState({ begrunnelse: value });
  };

  render () {
    const {
      oppholdBegrunnelser, bekreft, avbryt, landKodeObjekt, redigerbart,
    } = this.props;

    const landKode = kodeverkObjektTilKode(landKodeObjekt);
    const landTerm = kodeverkObjektTilTerm(landKodeObjekt);

    return (
      <div className="fjernland__linje">
        <div className="linje__land">{landTerm} ({landKode})</div>
        <div className="linje__begrunnelse">
          <Nav.Select disabled={!redigerbart} className="linje__nedtrekksvelger" bredde="fullbredde" value={this.state.begrunnelse} onChange={this.onChange} label="Velg begrunnelse:">
            <option disabled value="0" />
            {oppholdBegrunnelser.map(enkelt => <option key={enkelt.kode} value={enkelt.kode}>{enkelt.term}</option>)}
          </Nav.Select>
        </div>
        <div className="linje__knapper">
          <Nav.Knapp className="fjern__avbryt" disabled={!redigerbart} onClick={avbryt}>Avbryt</Nav.Knapp>
          <Nav.Knapp className="fjern__bekreft" disabled={!(redigerbart && this.state.begrunnelse !== '0')} onClick={() => bekreft(landKode, this.state.begrunnelse)}>Bekreft</Nav.Knapp>
        </div>
      </div>
    );
  }
}

OppholdslandHandlingSlett.propTypes = {
  avbryt: PT.func.isRequired,
  bekreft: PT.func.isRequired,
  landKodeObjekt: MPT.Kodeverk.isRequired,
  oppholdBegrunnelser: PT.arrayOf(MPT.Kodeverk).isRequired,
  redigerbart: PT.bool.isRequired,
};

export default OppholdslandHandlingSlett;
