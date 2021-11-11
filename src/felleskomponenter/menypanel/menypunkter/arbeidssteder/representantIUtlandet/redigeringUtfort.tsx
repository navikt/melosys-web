import React from "react";

import MKV from "../../../../../melosyskodeverk";
import * as Nav from "../../../../../navFrontend";
import * as Utils from "../../../../../utils";
import * as KV from "../../../../../kodeverk";

import { RepresentantIUtlandet } from "../../../../../kodeverk/form";

interface RedigeringUtfortProps {
  representantIUtlandet: RepresentantIUtlandet;
}
const RedigeringUtfort = ({ representantIUtlandet }: RedigeringUtfortProps) => (
  <Nav.Row>
    <Nav.Column xs="9">
      {representantIUtlandet.adresselinjer?.map((adresselinje) => (
        <Nav.Typo.Normaltekst key={Utils._uuid()}>{adresselinje}</Nav.Typo.Normaltekst>
      ))}
      <Nav.Typo.Normaltekst>
        {KV.kodeTilTerm(representantIUtlandet.representantLand, MKV.KTObjects.landkoder)}
      </Nav.Typo.Normaltekst>
    </Nav.Column>
  </Nav.Row>
);

export default RedigeringUtfort;
