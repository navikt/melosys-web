import React from "react";
import { KTObject } from "@navikt/melosys-kodeverk";

import * as KV from "../../../../../kodeverk";
import * as Nav from "../../../../../utils/navFrontend";
import * as Skjema from "../../../../skjema";

import MKV from "../../../../../melosyskodeverk";

import Sletterad from "../sletterad";

import { EnRedigeringsknappListeRedigerer } from "../../editerbartElementListe";

const Redigerer = ({
  redigerbart,
  overordnetFeltNavn,
  slett,
}: EnRedigeringsknappListeRedigerer<KV.Form.ArbeidsstedOffshore>) => (
  <div>
    <Nav.Row>
      <Nav.Column xs="7">
        <Skjema.Input
          label="Navn på innretning"
          feltNavn={`${overordnetFeltNavn}.enhetNavn`}
          disabled={!redigerbart}
          bredde="fullbredde"
          datoFelt={false}
        />
      </Nav.Column>
    </Nav.Row>
    <Nav.Row>
      <Nav.Column xs="7">
        <Skjema.Select
          label="Type innretning"
          feltNavn={`${overordnetFeltNavn}.innretningstype`}
          disabled={!redigerbart}
        >
          {MKV.KTObjects.innretningstyper.map((type: KTObject) => (
            <option key={type.kode} value={type.kode}>
              {type.term}
            </option>
          ))}
        </Skjema.Select>
      </Nav.Column>
      <Nav.Column xs="5">
        <Skjema.LandVelger
          label="Lands sokkel"
          feltNavn={`${overordnetFeltNavn}.innretningLandkode`}
          disabled={!redigerbart}
          bredde="fullbredde"
        />
      </Nav.Column>
    </Nav.Row>
    <Sletterad onClick={slett} />
  </div>
);

export default Redigerer;
