import React from 'react';

import * as KV from '../../../../../../kodeverk';
import * as Nav from '../../../../../../utils/navFrontend';
import * as Skjema from '../../../../../skjema';

import Sletterad from '../sletterad';

import { EnRedigeringsknappListeRedigerer } from '../../../editerbartElementListe';

const Redigerer = ({
  redigerbart,
  overordnetFeltNavn,
  slett,
}: EnRedigeringsknappListeRedigerer<KV.Form.ArbeidsstedOffshore>) => (
  <div>
    <Nav.Row>
      <Nav.Column xs="6">
        <Skjema.Input
          label="Navn på innretning"
          feltNavn={`${overordnetFeltNavn}.enhetNavn`}
          disabled={!redigerbart}
          bredde="fullbredde"
          datoFelt={false}
        />
      </Nav.Column>
      <Nav.Column xs="6">
        <Skjema.LandVelger
          label="Landsokkel"
          feltNavn={`${overordnetFeltNavn}.installasjonsLandkode`}
          disabled={!redigerbart}
          bredde="fullbredde"
        />
      </Nav.Column>
    </Nav.Row>
    <Sletterad onClick={slett} />
  </div>
);

export default Redigerer;
