import React from 'react';
import PT from 'prop-types';

import * as Nav from '../../utils/navFrontend';
import * as Skjema from '../skjema';

import Landvelger from '../skjema/landvelger';

import { BOOLSK } from '../../constants';

import './arbeidUtland.css';

const ArbeidUtlandEnkelt = ({ indeks, slettArbeidHandler, redigerbart }) => (
  <div className="arbeidUtland__enkelt">
    <Nav.Row>
      <Nav.Column xs="6">
        <Nav.Fieldset legend="Fysisk arbeidssted">
          <Skjema.Input disabled={!redigerbart} label="Navn" feltNavn={`arbeidUtland[${indeks}].foretakNavn`} />
          <Skjema.Input disabled={!redigerbart} label="Gatenavn" feltNavn={`arbeidUtland[${indeks}].adresse.gatenavn`} />
          <Skjema.Input disabled={!redigerbart} label="Husnummer" feltNavn={`arbeidUtland[${indeks}].adresse.husnummer`} />
          <Skjema.Input disabled={!redigerbart} label="Postnummer" feltNavn={`arbeidUtland[${indeks}].adresse.postnummer`} />
          <Skjema.Input disabled={!redigerbart} label="Region" feltNavn={`arbeidUtland[${indeks}].adresse.region`} />
          <Skjema.Input disabled={!redigerbart} label="Poststed" feltNavn={`arbeidUtland[${indeks}].adresse.poststed`} />
          <Landvelger disabled={!redigerbart} label="Land" feltNavn={`arbeidUtland[${indeks}].adresse.landKode`} />
        </Nav.Fieldset>
      </Nav.Column>
      <Nav.Column className="høyreKolonne" xs="6">
        <Nav.Fieldset>
          <Skjema.Input disabled={!redigerbart} label="Organisasjonsnummer / ID-nummer" feltNavn={`arbeidUtland[${indeks}].foretakOrgnr`} />
          <Skjema.RadioGruppe label="Er dette kun hjemmekontor?" feltNavn={`arbeidUtland[${indeks}].arbeidUtlandHjemmekontor`}>
            <Skjema.Radio disabled={!redigerbart} feltNavn={`arbeidUtland[${indeks}].arbeidUtlandHjemmekontor`} value={BOOLSK.SANN} label="Ja" />
            <Skjema.Radio disabled={!redigerbart} feltNavn={`arbeidUtland[${indeks}].arbeidUtlandHjemmekontor`} value={BOOLSK.USANN} label="Nei" />
          </Skjema.RadioGruppe>
        </Nav.Fieldset>
      </Nav.Column>
    </Nav.Row>

    <Nav.Knapp disabled={!redigerbart} mini onClick={() => slettArbeidHandler(indeks)}>- Fjern dette arbeidsstedet</Nav.Knapp>
  </div>
);

ArbeidUtlandEnkelt.propTypes = {
  redigerbart: PT.bool.isRequired,
  indeks: PT.number.isRequired,
  slettArbeidHandler: PT.func.isRequired,
};

export default ArbeidUtlandEnkelt;
