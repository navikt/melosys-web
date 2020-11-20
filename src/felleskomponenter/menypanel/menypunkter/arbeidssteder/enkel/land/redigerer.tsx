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
}: RedigererType<KV.Form.ArbeidsstedUtland>) => (
  <div className="arbeidssted__utland__redigerer">
    <Nav.Row>
      <Nav.Column xs="11">
        <Skjema.Input
          label="Navn på virksomhet"
          feltNavn={`${overordnetFeltNavn}.foretakNavn`}
          disabled={!redigerbart}
          bredde="fullbredde"
          datoFelt={false}
        />
      </Nav.Column>
    </Nav.Row>
    <Nav.Row>
      <Nav.Column xs="11">
        <Skjema.Input
          label="Gateadresse"
          feltNavn={`${overordnetFeltNavn}.adresse.gatenavn`}
          disabled={!redigerbart}
          bredde="fullbredde"
          datoFelt={false}
        />
      </Nav.Column>
    </Nav.Row>
    <div className="andre__rad">
      <Nav.Row>
        <Nav.Column xs="6">
          <Skjema.Input
            label="Postnummer"
            feltNavn={`${overordnetFeltNavn}.adresse.postnummer`}
            disabled={!redigerbart}
            bredde="fullbredde"
            datoFelt={false}
          />
        </Nav.Column>
        <Nav.Column xs="6">
          <Skjema.Input
            label="Poststed"
            feltNavn={`${overordnetFeltNavn}.adresse.poststed`}
            disabled={!redigerbart}
            bredde="fullbredde"
            datoFelt={false}
          />
        </Nav.Column>
      </Nav.Row>
      <Symboler.SlettElement
        onClick={slett}
        className="slett__knapp"
      />
    </div>
    <Nav.Row>
      <Nav.Column xs="5">
        <Skjema.Input
          label="Region"
          feltNavn={`${overordnetFeltNavn}.adresse.region`}
          disabled={!redigerbart}
          bredde="fullbredde"
          datoFelt={false}
        />
      </Nav.Column>
      <Nav.Column xs="6">
        <Skjema.LandVelger
          label="Land"
          feltNavn={`${overordnetFeltNavn}.adresse.landkode`}
          disabled={!redigerbart}
          bredde="fullbredde"
        />
      </Nav.Column>
    </Nav.Row>
  </div>
);

export default Redigerer;
