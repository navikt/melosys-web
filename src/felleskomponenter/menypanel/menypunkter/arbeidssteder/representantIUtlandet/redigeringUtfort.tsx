import React from "react";

import MKV from "../../../../../melosyskodeverk";
import * as Nav from "../../../../../navFrontend";
import * as Utils from "../../../../../utils";
import * as KV from "../../../../../kodeverk";

interface RedigeringUtfortProps {
  adresselinjer: string[];
  soknadsland: string[];
}
const RedigeringUtfort = ({ adresselinjer, soknadsland }: RedigeringUtfortProps) => (
  <Nav.Row>
    <Nav.Column xs="9">
      {adresselinjer?.map((adresselinje) => (
        <Nav.Typo.Normaltekst key={Utils._uuid()}>{adresselinje}</Nav.Typo.Normaltekst>
      ))}
      <Nav.Typo.Normaltekst>{KV.kodeTilTerm(soknadsland[0], MKV.KTObjects.landkoder)}</Nav.Typo.Normaltekst>
    </Nav.Column>
  </Nav.Row>
);

export default RedigeringUtfort;
