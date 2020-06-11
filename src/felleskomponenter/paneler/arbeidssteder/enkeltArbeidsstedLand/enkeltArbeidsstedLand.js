import React from 'react';
import PT from 'prop-types';

import * as Nav from '../../../../utils/navFrontend';
import * as Skjema from '../../../skjema';

const EnkeltArbeidsstedLand = ({
  redigerbart,
  overordnetFeltNavn,
  className,
}) => (
  <div className={className}>
    <Nav.Row>
      <Nav.Column xs="6">
        <Skjema.Input
          label="Navn"
          feltNavn={`${overordnetFeltNavn}.foretakNavn`}
          disabled={!redigerbart}
          placeholder="Skriv inn"
        />
      </Nav.Column>
      <Nav.Column xs="6">
        <Skjema.Input
          label="Gateadresse (valgfri)"
          feltNavn={`${overordnetFeltNavn}.adresse.gatenavn`}
          disabled={!redigerbart}
          placeholder="Skriv inn"
        />
      </Nav.Column>
    </Nav.Row>
    <Nav.Row>
      <Nav.Column xs="3">
        <Skjema.Input
          label="Postnummer (valgfri)"
          feltNavn={`${overordnetFeltNavn}.adresse.postnummer`}
          disabled={!redigerbart}
          placeholder="Skriv inn"
        />
      </Nav.Column>
      <Nav.Column xs="3">
        <Skjema.Input
          label="Poststed"
          feltNavn={`${overordnetFeltNavn}.adresse.poststed`}
          disabled={!redigerbart}
          placeholder="Skriv inn"
        />
      </Nav.Column>
    </Nav.Row>
    <Nav.Row>
      <Nav.Column xs="7">
        <Skjema.LandVelger
          label="Land"
          feltNavn={`${overordnetFeltNavn}.adresse.landkode`}
          disabled={!redigerbart}
          placeholder="Skriv inn"
          bredde="fullbredde"
        />
      </Nav.Column>
      <Nav.Column xs="5">
        <Skjema.Input
          label="Region (valgfri)"
          feltNavn={`${overordnetFeltNavn}.adresse.region`}
          disabled={!redigerbart}
          placeholder="Skriv inn"
        />
      </Nav.Column>
    </Nav.Row>
  </div>
);

EnkeltArbeidsstedLand.propTypes = {
  redigerbart: PT.bool.isRequired,
  overordnetFeltNavn: PT.string.isRequired,
  className: PT.string,
};

EnkeltArbeidsstedLand.defaultProps = {
  className: undefined,
};

export default EnkeltArbeidsstedLand;
