import React from "react";

import * as KV from "../../../../../../kodeverk";
import * as Nav from "../../../../../../utils/navFrontend";
import * as Skjema from "../../../../../skjema";

import Sletterad from "../sletterad";

import { EnRedigeringsknappListeRedigerer } from "../../../editerbartElementListe";

const Redigerer = ({
  redigerbart,
  overordnetFeltNavn,
  slett,
}: EnRedigeringsknappListeRedigerer<KV.Form.ArbeidsstedUtland>) => (
  <div>
    <Nav.Row>
      <Nav.Column xs="9">
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
      <Nav.Column xs="9">
        <Skjema.Input
          label="Gateadresse"
          feltNavn={`${overordnetFeltNavn}.adresse.gatenavn`}
          disabled={!redigerbart}
          bredde="fullbredde"
          datoFelt={false}
        />
      </Nav.Column>
    </Nav.Row>
    <Nav.Row>
      <Nav.Column xs="4">
        <Skjema.Input
          label="Postnummer"
          feltNavn={`${overordnetFeltNavn}.adresse.postnummer`}
          disabled={!redigerbart}
          bredde="fullbredde"
          datoFelt={false}
        />
      </Nav.Column>
      <Nav.Column xs="5">
        <Skjema.Input
          label="Poststed"
          feltNavn={`${overordnetFeltNavn}.adresse.poststed`}
          disabled={!redigerbart}
          bredde="fullbredde"
          datoFelt={false}
        />
      </Nav.Column>
    </Nav.Row>
    <Nav.Row>
      <Nav.Column xs="4">
        <Skjema.Input
          label="Region"
          feltNavn={`${overordnetFeltNavn}.adresse.region`}
          disabled={!redigerbart}
          bredde="fullbredde"
          datoFelt={false}
        />
      </Nav.Column>
      <Nav.Column xs="5">
        <Skjema.LandVelger
          label="Land"
          feltNavn={`${overordnetFeltNavn}.adresse.landkode`}
          disabled={!redigerbart}
          bredde="fullbredde"
        />
      </Nav.Column>
    </Nav.Row>
    <Sletterad onClick={slett} />
  </div>
);

export default Redigerer;
