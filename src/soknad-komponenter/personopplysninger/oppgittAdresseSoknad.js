import React from 'react';
import PT from 'prop-types';

import * as Nav from '../../utils/navFrontend';
import * as Skjema from '../skjema';
import LandVelger from '../skjema/landvelger';

const OppgittAdresseSoknad = ({ redigerbart }) => (
  <Nav.Row className="person__seksjon">
    <Nav.Column xs="6">
      <Nav.Fieldset legend="Annen adresse oppgitt i søknaden som ikke er registrert i TPS:">
        <dl className="person__detaljer">
          <Nav.Row>
            <Nav.Column xs="8">
              <Skjema.Input feltNavn="oppgittAdresseGatenavn" label="Gatenavn:" disabled={!redigerbart} />
            </Nav.Column>
            <Nav.Column xs="4">
              <Skjema.Input feltNavn="oppgittAdresseHusnummer" label="Husnummer:" disabled={!redigerbart} />
            </Nav.Column>
          </Nav.Row>
          <Nav.Row>
            <Nav.Column xs="12">
              <Skjema.Input feltNavn="oppgittAdresseRegion" label="Region:" disabled={!redigerbart} />
            </Nav.Column>
          </Nav.Row>
          <Nav.Row>
            <Nav.Column xs="4">
              <Skjema.Input feltNavn="oppgittAdressePostnummer" label="Postnr:" disabled={!redigerbart} />
            </Nav.Column>
            <Nav.Column xs="8">
              <Skjema.Input feltNavn="oppgittAdressePoststed" label="Poststed:" disabled={!redigerbart} />
            </Nav.Column>
          </Nav.Row>
          <Nav.Row>
            <Nav.Column xs="12">
              <LandVelger disabled={!redigerbart} bredde="fullbredde" feltNavn="oppgittAdresseLand" label="Land:" />
            </Nav.Column>
          </Nav.Row>
        </dl>
      </Nav.Fieldset>
    </Nav.Column>
  </Nav.Row>
);
OppgittAdresseSoknad.propTypes = {
  redigerbart: PT.bool.isRequired,
};

export default OppgittAdresseSoknad;
