import React from 'react';
import PT from 'prop-types';

import * as Nav from '../../../../utils/navFrontend';
import * as Skjema from '../../../../felleskomponenter/skjema';
import LandVelger from '../../../../felleskomponenter/skjema/landvelger';


import './foretakUtland.css';

const EnkeltForetak = ({ indeks, slettForetakHandler, redigerbart }) => (
  <Nav.Row className="foretakUtland__enkelt">
    <Nav.Column xs="6">
      <Nav.Fieldset legend="Om foretaket">
        <Skjema.Input disabled={!redigerbart} label="Firmanavn" feltNavn={`foretakUtland[${indeks}].navn`} />
        <Skjema.Input disabled={!redigerbart} label="Orgnr / ID nr" feltNavn={`foretakUtland[${indeks}].orgnr`} />
      </Nav.Fieldset>
    </Nav.Column>
    <Nav.Column xs="6">
      <Nav.Fieldset legend="Foretakets adresse">
        <Skjema.Input disabled={!redigerbart} label="Gatenavn" feltNavn={`foretakUtland[${indeks}].adresse.gatenavn`} />
        <Skjema.Input disabled={!redigerbart} label="Husnummer" feltNavn={`foretakUtland[${indeks}].adresse.husnummer`} />
        <Skjema.Input disabled={!redigerbart} label="Postnummer" feltNavn={`foretakUtland[${indeks}].adresse.postnummer`} />
        <Skjema.Input disabled={!redigerbart} label="Region" feltNavn={`foretakUtland[${indeks}].adresse.region`} />
        <Skjema.Input disabled={!redigerbart} label="Poststed" feltNavn={`foretakUtland[${indeks}].adresse.poststed`} />
        <LandVelger disabled={!redigerbart} label="Land" feltNavn={`foretakUtland[${indeks}].adresse.landkode`} />
      </Nav.Fieldset>
    </Nav.Column>
    <Nav.Knapp disabled={!redigerbart} mini onClick={() => slettForetakHandler(indeks)}>- Fjern dette foretaket</Nav.Knapp>
  </Nav.Row>
);

EnkeltForetak.propTypes = {
  redigerbart: PT.bool,
  indeks: PT.number.isRequired,
  slettForetakHandler: PT.func.isRequired,
};
EnkeltForetak.defaultProps = {
  redigerbart: true,
};
export default EnkeltForetak;
