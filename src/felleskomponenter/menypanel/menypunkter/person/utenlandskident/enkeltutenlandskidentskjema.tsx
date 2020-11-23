import React from 'react';

import * as Skjema from '../../../../skjema';
import * as Nav from '../../../../../utils/navFrontend';
import * as Symboler from '../../symboler';

import Landvelger from '../../../../skjema/landvelger';

import './enkeltutenlandskidentskjema.css';

interface EnkeltUtenlandskIdentSkjemaProps {
  slett: () => void,
  redigerbart: boolean,
  overordnetFeltNavn: string,
}

const EnkeltUtenlandskIdentSkjema = ({
  overordnetFeltNavn,
  slett,
  redigerbart,
}: EnkeltUtenlandskIdentSkjemaProps) => (
  <div className="enkeltUtenlandskIdentSkjema">
    <Nav.Row>
      <Nav.Column xs="5">
        <Skjema.Input
          disabled={!redigerbart}
          bredde="fullbredde"
          feltNavn={`${overordnetFeltNavn}.ident`}
          label="Utenlandsk ID"
          datoFelt={false}
        />
      </Nav.Column>
      <Nav.Column xs="6">
        <Landvelger
          disabled={!redigerbart}
          feltNavn={`${overordnetFeltNavn}.landkode`}
          label="Land"
          bredde="fullbredde"
        />
      </Nav.Column>
    </Nav.Row>
    <Symboler.Slett
      onClick={slett}
      className="slett__symbol"
    />
  </div>
);

export default EnkeltUtenlandskIdentSkjema;
