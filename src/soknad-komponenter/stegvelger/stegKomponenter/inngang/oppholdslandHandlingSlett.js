import React, { useState } from 'react';
import PT from 'prop-types';
import * as KV from '../../../../kodeverk';
import * as Nav from '../../../../utils/navFrontend';
import * as MPT from '../../../../proptypes';

function OppholdslandHandlingSlett(props) {
  const [begrunnelse, setBegrunnelse] = useState('0');

  const onChange = event => {
    const { value } = event.currentTarget;
    setBegrunnelse(value);
  };
  const {
    oppholdBegrunnelser, bekreft, avbryt, landKodeObjekt, redigerbart,
  } = props;
  const landKode = KV.objektTilKode(landKodeObjekt);
  const landTerm = KV.objektTilTerm(landKodeObjekt);
  const innhold = (
    <div className="fjernland__linje">
      <div className="linje__land">{landTerm} ({landKode})</div>
      <div className="linje__begrunnelse">
        <Nav.Select disabled={!redigerbart} className="linje__nedtrekksvelger" bredde="fullbredde" value={begrunnelse} onChange={onChange} label="Velg begrunnelse:">
          <option disabled value="0" />
          {oppholdBegrunnelser.map(enkelt => <option key={enkelt.kode} value={enkelt.kode}>{enkelt.term}</option>)}
        </Nav.Select>
      </div>
      <div className="linje__knapper">
        <Nav.Knapp className="fjern__avbryt" disabled={!redigerbart} onClick={avbryt}>Avbryt</Nav.Knapp>
        <Nav.Knapp className="fjern__bekreft" disabled={!(redigerbart && begrunnelse !== '0')} onClick={() => bekreft(landKode, begrunnelse)}>Bekreft</Nav.Knapp>
      </div>
    </div>
  );
  return innhold;
}

OppholdslandHandlingSlett.propTypes = {
  avbryt: PT.func.isRequired,
  bekreft: PT.func.isRequired,
  landKodeObjekt: MPT.Kodeverk.isRequired,
  oppholdBegrunnelser: PT.arrayOf(MPT.Kodeverk).isRequired,
  redigerbart: PT.bool.isRequired,
};

export default OppholdslandHandlingSlett;
