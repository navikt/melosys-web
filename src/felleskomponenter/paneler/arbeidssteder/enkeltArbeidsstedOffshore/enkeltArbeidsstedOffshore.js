import React from 'react';
import PT from 'prop-types';

import * as Nav from '../../../../utils/navFrontend';
import * as Skjema from '../../../skjema';

const EnkeltArbeidsstedOffshore = ({
  redigerbart,
  overordnetFeltNavn,
  className,
}) => (
  <div className={className}>
    <Nav.Row>
      <Nav.Column xs="5">
        <Skjema.Input
          label="Navn på innretning"
          feltNavn={`${overordnetFeltNavn}.enhetNavn`}
          disabled={!redigerbart}
          placeholder="Skriv inn"
        />
      </Nav.Column>
      <Nav.Column xs="4">
        <Skjema.LandVelger
          label="Hvilket lands sokkel?"
          feltNavn={`${overordnetFeltNavn}.installasjonsLandkode`}
          disabled={!redigerbart}
          placeholder="Skriv inn..."
        />
      </Nav.Column>
    </Nav.Row>
  </div>
);

EnkeltArbeidsstedOffshore.propTypes = {
  redigerbart: PT.bool.isRequired,
  overordnetFeltNavn: PT.string.isRequired,
  className: PT.string,
};

EnkeltArbeidsstedOffshore.defaultProps = {
  className: undefined,
};

export default EnkeltArbeidsstedOffshore;
