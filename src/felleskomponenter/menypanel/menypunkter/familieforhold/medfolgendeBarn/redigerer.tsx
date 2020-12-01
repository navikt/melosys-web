import React from 'react';

import * as KV from '../../../../../kodeverk';
import * as Nav from '../../../../../utils/navFrontend';
import * as Skjema from '../../../../skjema';
import * as Symboler from '../../symboler';

import { EnRedigeringsknappListeRedigerer } from '../../editerbartElementListe';

import './redigerer.css';

const Redigerer = ({
  redigerbart,
  overordnetFeltNavn,
  slett,
}: EnRedigeringsknappListeRedigerer<KV.Form.MedfolgendeBarn>) => (
  <Nav.Row className="medfolgende-barn__redigerer">
    <Nav.Column xs="5">
      <Skjema.Input
        label="Fullt navn"
        feltNavn={`${overordnetFeltNavn}.navn`}
        disabled={!redigerbart}
        bredde="fullbredde"
        datoFelt={false}
      />
    </Nav.Column>
    <Nav.Column xs="5">
      <Skjema.Input
        label="F.nr./d-nr."
        feltNavn={`${overordnetFeltNavn}.fnr`}
        disabled={!redigerbart}
        bredde="fullbredde"
        datoFelt={false}
      />
    </Nav.Column>
    <Symboler.Slett
      onClick={slett}
      className="slett-symbol"
    />
  </Nav.Row>
);

export default Redigerer;
