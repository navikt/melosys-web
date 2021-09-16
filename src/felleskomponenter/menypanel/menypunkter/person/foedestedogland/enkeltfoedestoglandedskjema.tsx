import React from "react";

import * as Skjema from "../../../../skjema";
import * as Nav from "../../../../../utils/navFrontend";

import Landvelger from "../../../../skjema/landvelger";

import "./enkeltfoedestedoglandskjema.css";

interface EnkeltFoedestedSkjemaProps {
  redigerbart: boolean;
  overordnetFeltNavn: string;
}

const Enkeltfoedestoglandedskjema = ({ overordnetFeltNavn, redigerbart }: EnkeltFoedestedSkjemaProps) => (
  <div className="enkeltFoedestedSkjema">
    <Nav.Row>
      <Nav.Column xs="5">
        <Skjema.Input
          disabled={!redigerbart}
          bredde="fullbredde"
          feltNavn={`${overordnetFeltNavn}.foedested`}
          label="Fødested"
          datoFelt={false}
        />
      </Nav.Column>
      <Nav.Column xs="6">
        <Landvelger
          disabled={!redigerbart}
          feltNavn={`${overordnetFeltNavn}.foedeland`}
          label="Fødeland"
          bredde="fullbredde"
        />
      </Nav.Column>
    </Nav.Row>
  </div>
);

export default Enkeltfoedestoglandedskjema;
