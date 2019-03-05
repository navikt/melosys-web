import React from 'react';
import PT from 'prop-types';

import * as Nav from '../../utils/navFrontend';
import * as Skjema from '../skjema';
import LandVelger from '../skjema/landvelger';

const OppgittAdresseSoknad = props => {
  const { redigerbart } = props;
  return (
    <Nav.Row className="person__seksjon">
      <Nav.Column xs="6">
        <Nav.Fieldset legend="Adresse oppgitt i søknad:">
          <dl className="person__detaljer">
            <Skjema.Input feltNavn="oppgittAdresseGatenavn" label="Gatenavn:" disabled={!redigerbart} />
            <Skjema.Input feltNavn="oppgittAdresseHusnummer" bredde="XS" label="Husnummer:" disabled={!redigerbart} />
            <Skjema.Input feltNavn="oppgittAdresseRegion" label="Region:" disabled={!redigerbart} />
            <Nav.Row>
              <Nav.Column xs="4">
                <Skjema.Input feltNavn="oppgittAdressePostnummer" bredde="XS" label="Postnr:" disabled={!redigerbart} />
              </Nav.Column>
              <Nav.Column xs="8">
                <Skjema.Input feltNavn="oppgittAdressePoststed" label="Poststed:" disabled={!redigerbart} />
              </Nav.Column>
            </Nav.Row>
            <LandVelger disabled={!redigerbart} feltNavn="oppgittAdresseLand" label="Land:" />
          </dl>
        </Nav.Fieldset>
      </Nav.Column>
    </Nav.Row>
  );
};
OppgittAdresseSoknad.propTypes = {
  props: PT.node.isRequired,
  redigerbart: PT.bool.isRequired,
};

export default OppgittAdresseSoknad;
