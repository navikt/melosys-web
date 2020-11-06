import React, { MouseEventHandler } from 'react';

import * as Nav from '../../../../../utils/navFrontend';
import * as Mui from '../../../../../felleskomponenter/ui';
import * as Skjema from '../../../../skjema';

import './felter.css';

interface Felter {
  tittel: string,
  redigerbart: boolean,
  bekreft: MouseEventHandler,
}

const Felter = ({
  tittel,
  redigerbart,
  bekreft,
}: Felter) => (
  <div className="felter">
    <Nav.Fieldset legend={tittel}>
      <dl className="person__detaljer">
        <Nav.Row>
          <Nav.Column xs="8">
            <Skjema.Input
              feltNavn="oppgittAdresseGatenavn"
              label="Gatenavn:"
              disabled={!redigerbart}
              bredde="fullbredde"
              datoFelt={false}
            />
          </Nav.Column>
          <Nav.Column xs="4">
            <Skjema.Input
              feltNavn="oppgittAdresseHusnummer"
              label="Husnummer:"
              disabled={!redigerbart}
              bredde="fullbredde"
              datoFelt={false}
            />
          </Nav.Column>
        </Nav.Row>
        <Nav.Row>
          <Nav.Column xs="4">
            <Skjema.Input
              feltNavn="oppgittAdressePostnummer"
              label="Postnr:"
              disabled={!redigerbart}
              bredde="fullbredde"
              datoFelt={false}
            />
          </Nav.Column>
          <Nav.Column xs="8">
            <Skjema.Input
              feltNavn="oppgittAdressePoststed"
              label="Poststed:"
              disabled={!redigerbart}
              bredde="fullbredde"
              datoFelt={false}
            />
          </Nav.Column>
        </Nav.Row>
        <Nav.Row>
          <Nav.Column xs="8">
            <Skjema.Input
              feltNavn="oppgittAdresseRegion"
              label="Region:"
              disabled={!redigerbart}
              bredde="fullbredde"
              datoFelt={false}
            />
          </Nav.Column>
          <Nav.Column xs="4">
            <Skjema.LandVelger disabled={!redigerbart} bredde="fullbredde" feltNavn="oppgittAdresseLand" label="Land:" />
          </Nav.Column>
        </Nav.Row>
      </dl>
    </Nav.Fieldset>
    <Mui.Knapp
      onClick={bekreft}
      capitalCase
      disabled={!redigerbart}
      type="hoved"
    >
      Lagre
    </Mui.Knapp>
  </div>
);

export default Felter;
