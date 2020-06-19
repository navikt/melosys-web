import React from 'react';
import PT from 'prop-types';

import * as Nav from '../../../../utils/navFrontend';
import * as Skjema from '../../../skjema';

/* TODO: hente fra kodeverk (MELOSYS-3784) */
const typeFlyvninger = [
  {
    kode: 'NASJONAL',
    term: 'NASJONAL',
  },
  {
    kode: 'INTERNASJONAL',
    term: 'INTERNASJONAL',
  },
  {
    kode: 'BEGGE',
    term: 'BEGGE',
  },
];

const EnkeltArbeidsstedFly = ({
  redigerbart,
  overordnetFeltNavn,
  className,
}) => (
  <div className={className}>
    <Nav.Row>
      <Nav.Column xs="4">
        <Skjema.Input
          label="Navn på hjemmebase"
          feltNavn={`${overordnetFeltNavn}.hjemmebaseNavn`}
          disabled={!redigerbart}
          placeholder="Skriv inn"
        />
      </Nav.Column>
      <Nav.Column xs="4">
        <Skjema.LandVelger
          label="Hjemmebasens land"
          feltNavn={`${overordnetFeltNavn}.hjemmebaseLand`}
          disabled={!redigerbart}
          placeholder="Skriv inn"
          bredde="fullbredde"
        />
      </Nav.Column>
      <Nav.Column xs="4">
        <Skjema.Select
          label="Type flyvninger"
          feltNavn={`${overordnetFeltNavn}.typeFlyvninger`}
          disabled={!redigerbart}
          placeholder="Skriv inn"
        >
          {
            typeFlyvninger.map(type => <option key={type.kode} value={type.kode}>{type.term}</option>)
          }
        </Skjema.Select>
      </Nav.Column>
    </Nav.Row>
  </div>
);

EnkeltArbeidsstedFly.propTypes = {
  redigerbart: PT.bool.isRequired,
  overordnetFeltNavn: PT.string.isRequired,
  className: PT.string,
};

EnkeltArbeidsstedFly.defaultProps = {
  className: undefined,
};

export default EnkeltArbeidsstedFly;
