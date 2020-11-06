import React from 'react';
import PT from 'prop-types';

import * as Nav from '../../../../../utils/navFrontend';
import * as Skjema from '../../../../skjema';

const EnkeltArbeidsforholdUtland = ({
  redigerbart,
  overordnetFeltNavn,
  className,
}) => (
  <div className={className}>
    <Nav.Row>
      <Nav.Column xs="6">
        <Skjema.Input
          label="Navn på virksomheten"
          feltNavn={`${overordnetFeltNavn}.navn`}
          disabled={!redigerbart}
        />
      </Nav.Column>
      <Nav.Column xs="6">
        <Skjema.Input
          label="Registreringsnummer"
          feltNavn={`${overordnetFeltNavn}.orgnr`}
          disabled={!redigerbart}
        />
      </Nav.Column>
    </Nav.Row>
    <Nav.Row>
      <Nav.Column xs="6">
        <Skjema.Input
          label="Adresse til arbeidsgiver"
          feltNavn={`${overordnetFeltNavn}.adresse.gatenavn`}
          disabled={!redigerbart}
        />
      </Nav.Column>
      <Nav.Column xs="3">
        <Skjema.Input
          label="Poststed"
          feltNavn={`${overordnetFeltNavn}.adresse.poststed`}
          disabled={!redigerbart}
        />
      </Nav.Column>
      <Nav.Column xs="3">
        <Skjema.Input
          label="Postnummer"
          feltNavn={`${overordnetFeltNavn}.adresse.postnummer`}
          disabled={!redigerbart}
        />
      </Nav.Column>
    </Nav.Row>
    <Nav.Row>
      <Nav.Column xs="6">
        <Skjema.LandVelger
          label="Land"
          feltNavn={`${overordnetFeltNavn}.adresse.landkode`}
          disabled={!redigerbart}
        />
      </Nav.Column>
    </Nav.Row>
  </div>
);

EnkeltArbeidsforholdUtland.propTypes = {
  redigerbart: PT.bool.isRequired,
  overordnetFeltNavn: PT.string.isRequired,
  className: PT.string,
};

EnkeltArbeidsforholdUtland.defaultProps = {
  className: undefined,
};

export default EnkeltArbeidsforholdUtland;
