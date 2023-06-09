import React from "react";

import * as Skjema from "../../../../skjema";
import * as Nav from "../../../../../navFrontend";
import * as Ikoner from "../../../../../resources/images";

import * as Mui from "../../../../ui";

import Landvelger from "../../../../skjema/landvelger";

import "./enkeltutenlandskidentskjema.css";

interface EnkeltUtenlandskIdentSkjemaProps {
  slett: () => void;
  redigerbart: boolean;
  overordnetFeltNavn: string;
}

const EnkeltUtenlandskIdentSkjema = ({ overordnetFeltNavn, slett, redigerbart }: EnkeltUtenlandskIdentSkjemaProps) => (
  <Nav.Row className="enkeltUtenlandskIdentSkjema">
    <Nav.Column xs="5">
      <Skjema.Input
        disabled={!redigerbart}
        bredde="fullbredde"
        feltNavn={`${overordnetFeltNavn}.ident`}
        label="Utenlandsk ID"
      />
    </Nav.Column>
    <Nav.Column xs="5">
      <Landvelger
        disabled={!redigerbart}
        feltNavn={`${overordnetFeltNavn}.landkode`}
        label="Land"
        bredde="fullbredde"
        visAlleLandkoder
      />
    </Nav.Column>
    <Nav.Column xs="2" className="slett__symbol">
      <Mui.IkonKnapp ariaLabel="Fjern utenlandsk ident" ikon={Ikoner.Bin} onClick={slett} />
    </Nav.Column>
  </Nav.Row>
);

export default EnkeltUtenlandskIdentSkjema;
