import React from "react";

import * as Skjema from "../../../../skjema";
import * as Nav from "../../../../../navFrontend";

import "./enkeltfoedestedoglandskjema.css";

interface EnkeltFoedestedOgLandSkjemaProps {
  redigerbart: boolean;
}

const Enkeltfoedestedoglandskjema = ({ redigerbart }: EnkeltFoedestedOgLandSkjemaProps) => (
  <div className="enkeltFoedestedOgLandSkjema">
    <Nav.Row>
      <Nav.Column xs="5">
        <Skjema.Input
          disabled={!redigerbart}
          feltNavn="foedestedOgLand.foedested"
          label="Fødested"
          bredde="fullbredde"
        />
      </Nav.Column>
      <Nav.Column xs="6">
        <Skjema.LandVelger
          disabled={!redigerbart}
          feltNavn="foedestedOgLand.foedeland"
          label="Fødeland"
          bredde="fullbredde"
        />
      </Nav.Column>
    </Nav.Row>
  </div>
);

export default Enkeltfoedestedoglandskjema;
