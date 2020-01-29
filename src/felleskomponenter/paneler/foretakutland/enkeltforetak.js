import React from 'react';
import PT from 'prop-types';

import * as Nav from '../../../utils/navFrontend';
import * as Skjema from '../../skjema';
import LandVelger from '../../skjema/landvelger';

import './enkeltforetak.css';

const EnkeltForetak = ({ indeks, slettForetakHandler, redigerbart }) => (
  <div className="foretakUtland__enkelt">
    <Nav.Row>
      <Nav.Column xs="6">
        <Nav.Fieldset legend="Om foretaket">
          {/* eslint-disable-next-line max-len */}
          <Skjema.Checkbox className="selvstendigNaeringsvirksomhet" disabled={!redigerbart} label="Opplysningene gjelder selvstendig næringsvirksomhet" feltNavn={`foretakUtland[${indeks}].selvstendigNaeringsvirksomhet`} />
        </Nav.Fieldset>
      </Nav.Column>
      <Nav.Column xs="6">
        <Nav.Fieldset legend="Foretakets adresse">
          <Skjema.Input disabled={!redigerbart} label="Gatenavn" feltNavn={`foretakUtland[${indeks}].adresse.gatenavn`} />
        </Nav.Fieldset>
      </Nav.Column>
    </Nav.Row>
    <Nav.Row>
      <Nav.Column xs="6">
        <Skjema.Input disabled={!redigerbart} label="Firmanavn" feltNavn={`foretakUtland[${indeks}].navn`} />
        <Skjema.Input disabled={!redigerbart} label="Organisasjons- / ID nummer" feltNavn={`foretakUtland[${indeks}].orgnr`} />
      </Nav.Column>
      <Nav.Column xs="6">
        <Skjema.Input disabled={!redigerbart} label="Husnummer" feltNavn={`foretakUtland[${indeks}].adresse.husnummer`} />
        <Nav.Row>
          <Nav.Column xs="6">
            <Skjema.Input disabled={!redigerbart} label="Postnummer" feltNavn={`foretakUtland[${indeks}].adresse.postnummer`} />
          </Nav.Column>
          <Nav.Column xs="6">
            <Skjema.Input disabled={!redigerbart} label="Poststed" feltNavn={`foretakUtland[${indeks}].adresse.poststed`} />
          </Nav.Column>
        </Nav.Row>
        <Skjema.Input disabled={!redigerbart} label="Region" feltNavn={`foretakUtland[${indeks}].adresse.region`} />
        <LandVelger disabled={!redigerbart} label="Land" feltNavn={`foretakUtland[${indeks}].adresse.landkode`} />
      </Nav.Column>
      <Nav.Knapp disabled={!redigerbart} mini onClick={() => slettForetakHandler(indeks)}>- Fjern dette foretaket</Nav.Knapp>
    </Nav.Row>
  </div>
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
