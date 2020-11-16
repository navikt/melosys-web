import React from 'react';
import { KTObject } from '@navikt/melosys-kodeverk';

import * as KV from '../../../../../../kodeverk';
import * as Nav from '../../../../../../utils/navFrontend';
import * as Skjema from '../../../../../skjema';
import * as Symboler from '../../../symboler';

import MKV from '../../../../../../melosyskodeverk';

import { Redigerer as RedigererType } from '../types';

import './redigerer.css';

const Redigerer = ({
  redigerbart,
  overordnetFeltNavn,
  slett,
}: RedigererType<KV.Form.ArbeidsstedFly>) => (
  <div className="arbeidssted__fly__redigerer">
    <Nav.Row>
      <Nav.Column xs="6">
        <Skjema.Input
          label="Navn på hjemmebase"
          feltNavn={`${overordnetFeltNavn}.hjemmebaseNavn`}
          disabled={!redigerbart}
          bredde="fullbredde"
          datoFelt={false}
        />
      </Nav.Column>
    </Nav.Row>
    <div className="andre__rad">
      <Nav.Row>
        <Nav.Column xs="6">
          <Skjema.Select
            label="Type flyvninger"
            feltNavn={`${overordnetFeltNavn}.typeFlyvninger`}
            disabled={!redigerbart}
          >
            {
              MKV.KTObjects.flyvningstyper.map((type: KTObject) => <option key={type.kode} value={type.kode}>{type.term}</option>)
            }
          </Skjema.Select>
        </Nav.Column>
        <Nav.Column xs="6">
          <Skjema.LandVelger
            label="Hjemmebasens land"
            feltNavn={`${overordnetFeltNavn}.hjemmebaseLand`}
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
  </div>
);

export default Redigerer;
