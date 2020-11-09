import React from 'react';

import * as KV from '../../../../../../kodeverk';
import * as Nav from '../../../../../../utils/navFrontend';
import * as Skjema from '../../../../../skjema';
import * as Symboler from '../../../symboler';

import { Redigerer as RedigererType } from '../types';

import './redigerer.css';

const Redigerer = ({
  redigerbart,
  overordnetFeltNavn,
  slett,
}: RedigererType<KV.Form.ArbeidsstedOffshore>) => (
  <div className="arbeidssted__offshore__redigerer">
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
    <Symboler.SlettElement
      onClick={slett}
      className="slett__knapp"
    />
  </div>
);

export default Redigerer;
